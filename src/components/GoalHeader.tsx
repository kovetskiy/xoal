import React from 'react';
import { Goal } from '../Goals';
import { Heading, HStack, Tag, Center } from '@chakra-ui/react';
import { GoalTimer } from './GoalTimer';

export const GoalHeader = ({ goal }: { goal: Goal }) => {
  return (
    <>
      <Heading>{goal.text}</Heading>
      <HStack marginTop="4" justify="center" spacing="3">
        <GoalTimer goal={goal} />
        <Tag>{goal.duration} minutes</Tag>
      </HStack>
    </>
  );
};

export const GoalEmptyHeader = () => {
  return <Heading>No goal yet. Set a new one?</Heading>;
};
