import React from 'react';
import { Input, Code, Text } from '@chakra-ui/react';

export type Props = {
  onSubmit: (text: string) => void;
};

export const GoalInput = (props: Props) => {
  const [goal, setGoal] = React.useState('');
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        props.onSubmit(goal);
        setGoal('');
      }}
    >
      <Input
        autoFocus={true}
        placeholder="New goal"
        value={goal}
        onChange={(event) => {
          setGoal(event.target.value);
        }}
      />
      <Text color="gray.500" marginTop="2" fontSize="xs">
        Use @X to set X minutes for a new goal. Example:{' '}
        <Text as="i">manage inbox @20</Text>
      </Text>
      <Text color="gray.500" fontSize="xs">
        Use /add X to add X minutes to the last goal. Example:{' '}
        <Text as="i">/add 20</Text>
      </Text>
    </form>
  );
};
