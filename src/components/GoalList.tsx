import React from 'react';
import moment from 'moment';
import { Text, ListItem, HStack, Tag, UnorderedList } from '@chakra-ui/react';
import { Goal } from '../Goals';

const renderGoal = (goal: Goal, index: number) => {
  if (!goal.finishedAt) {
    return;
  }

  const started = moment(goal.startedAt);
  const finished = moment(goal.finishedAt);

  const duration = moment.duration(finished.diff(started));
  const chunks = [];
  if (duration.get('hours') > 0) {
    chunks.push(duration.get('hours') + 'h');
  }
  if (duration.get('minutes') > 0) {
    chunks.push(duration.get('minutes') + 'm');
  }
  if (duration.get('seconds') > 0) {
    chunks.push(duration.get('seconds') + 's');
  }

  return (
    <ListItem key={index.toString()}>
      <HStack spacing="1">
        <Tag>{started.format('HH:mm:ss')}</Tag>
        {chunks.length ? <Tag>{chunks.join('')}</Tag> : null}
        {goal.duration ? <Tag>{goal.duration}m</Tag> : null}
        <Text fontSize="md">{goal.text}</Text>
      </HStack>
    </ListItem>
  );
};

export type Props = {
  goals: Goal[];
};

export const GoalList = ({ goals }: Props) => {
  if (!goals) {
    return <></>;
  }

  return (
    <UnorderedList>{goals.slice(0).reverse().map(renderGoal)}</UnorderedList>
  );
};
