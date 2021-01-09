import React from 'react';
import { Tag } from '@chakra-ui/react';
import { Goal } from '../Goals';
import moment from 'moment';

const diff = (goal: Goal) => {
  const started = moment(goal.startedAt);
  const finished = moment(new Date());

  return moment.utc(finished.diff(started)).format('HH:mm:ss');
};

export const GoalTimer = ({ goal }: { goal: Goal }) => {
  const [duration, setDuration] = React.useState(diff(goal));

  const tick = () => {
    setDuration(diff(goal));
  };

  React.useEffect(() => {
    tick();

    const timer = setInterval(tick, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [goal]);

  return <Tag>{duration}</Tag>;
};
