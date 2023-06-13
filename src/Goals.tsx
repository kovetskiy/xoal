/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Box, Divider } from '@chakra-ui/react';
import React from 'react';
import { GoalHeader, GoalEmptyHeader } from './components/GoalHeader';
import { GoalInput } from './components/GoalInput';
import { GoalList } from './components/GoalList';
import moment from 'moment';
import notifier from 'node-notifier';

export type Props = {
  today: string;
};

export type Goal = {
  text: string;
  startedAt: Date;
  finishedAt?: Date;
  duration: number;
};

const store = new (require('electron-store'))();

type ParsedGoal = {
  text: string;
  duration?: number;
};

const parseGoal = (text: string): ParsedGoal => {
  const matches = text.match(/(.*)\s+@([\d.]+)\s*$/);
  if (!matches) {
    return { text: text };
  }
  return {
    text: matches[1],
    duration: parseFloat(matches[2]),
  };
};

const minutesSince = (goal: Goal): number => {
  const diff = moment.duration(moment(new Date()).diff(moment(goal.startedAt)));
  return diff.asMinutes();
};

export const Goals = ({ today }: Props) => {
  console.log('today', today);
  const [stateGoals, setStateGoals] = React.useState<Goal[]>(store.get(today));
  console.log('stateGoals', stateGoals);

  const [currentGoal, setCurrentGoal] = React.useState(
    stateGoals && stateGoals.length
      ? stateGoals[stateGoals.length - 1]
      : undefined
  );

  const startGoal = (text: string) => {
    const parsed = parseGoal(text);

    const nextGoal: Goal = {
      text: parsed.text,
      startedAt: new Date(),
      duration: parsed.duration || 10,
    };

    const goals = finishLastGoal(nextGoal.startedAt);

    goals.push(nextGoal);

    store.set(today, goals);
    setCurrentGoal(nextGoal);
    setStateGoals(goals);
  };

  const submitGoal = (text: string) => {
    if (text.startsWith('/add ')) {
      const matches = text.match(/\/add\s+@?([-.\d]+)\s*$/);
      if (matches) {
        addMinutesLastGoal(parseFloat(matches[1]));
        return;
      }
    }

    // check if it's just a number
    if (text.match(/^[\d.]+$/)) {
      // eslint-disable-next-line semi
      addMinutesLastGoal(parseFloat(text));
      return;
    }

    startGoal(text);
  };

  const finishLastGoal = (finishedAt: Date): Goal[] => {
    if (!stateGoals || stateGoals.length === 0) {
      return [];
    }

    const result = stateGoals.slice(0);
    result[result.length - 1].finishedAt = finishedAt;
    return result;
  };

  const addMinutesLastGoal = (minutes: number) => {
    if (!stateGoals || stateGoals.length === 0) {
      return;
    }

    const result = stateGoals.slice(0);
    result[result.length - 1].duration += minutes;

    store.set(today, result);
    setCurrentGoal(result[result.length - 1]);
    setStateGoals(result);
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (!currentGoal) {
        return;
      }

      if (!currentGoal.duration) {
        return;
      }

      const took = minutesSince(currentGoal);
      if (took > currentGoal.duration) {
        notifier.notify({
          title: '⌛Time is up!',
          message: currentGoal.text,
          timeout: 3,
        });
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [currentGoal]);

  return (
    <>
      <Box padding={10} textAlign="center">
        {currentGoal ? <GoalHeader goal={currentGoal} /> : <GoalEmptyHeader />}
      </Box>
      <Divider />
      <Box padding={10}>
        <GoalInput onSubmit={submitGoal} />
      </Box>
      <Divider />
      <Box padding={10}>
        <GoalList goals={stateGoals} />
      </Box>
    </>
  );
};
