/* eslint-disable @typescript-eslint/no-var-requires */
import { Box, Divider } from '@chakra-ui/react';
import React from 'react';
import { GoalHeader, GoalEmptyHeader } from './components/GoalHeader';
import { GoalInput } from './components/GoalInput';
import { GoalList } from './components/GoalList';
import moment from 'moment';

const { spawn } = require('child_process');

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

const notifier = require('node-notifier');

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
    duration: parseFloat(matches[2])
  };
};

const minutesSince = (goal: Goal): number => {
  const diff = moment.duration(moment(new Date()).diff(moment(goal.startedAt)));
  return diff.asMinutes();
};

export const Goals = ({ today }: Props) => {
  const [stateGoals, setStateGoals] = React.useState<Goal[]>(store.get(today));

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
      duration: parsed.duration || 10
    };

    const goals = finishLastGoal(nextGoal.startedAt);

    goals.push(nextGoal);

    if (process.env.HOOK_NEW_GOAL) {
      spawn(process.env.HOOK_NEW_GOAL, {
        env: {
          ...process.env,
          XOAL_GOAL: nextGoal.text
        }
      });
    }

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
          title: 'xoal: time issue',
          message: 'No time left: ' + currentGoal.text,
          timeout: 2
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
