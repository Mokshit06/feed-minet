import {
  Box,
  Heading,
  Stack,
  RadioGroup,
  Radio,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useUser } from '../hooks/auth';
import { UserRole } from '@prisma/client';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import api from '../lib/api';

export default function Dashboard() {
  const { isLoading, isError, data: user, isAuthenticated } = useUser();

  if (isLoading || isError || !user || !isAuthenticated) {
    return null;
  }

  if (!user.role) {
    return <ChooseRole />;
  }

  return (
    <Box>
      {user.role === UserRole.DONATOR ? (
        <Box>
          <Button as="a" href="/donation">
            Donate
          </Button>
        </Box>
      ) : user.role === UserRole.PICKUP ? (
        <Box></Box>
      ) : (
        <Box></Box>
      )}
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </Box>
  );
}

function ChooseRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const updateUser = useMutation(
    async (data: any) => api.put('/auth/me', data),
    {
      onSuccess() {
        queryClient.invalidateQueries('/auth/me');

        toast({
          title: 'Role updated',
          description: `Your profile role has been updated!`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  return (
    <Box>
      <Heading>Choose role</Heading>
      <RadioGroup onChange={role => setRole(role as UserRole)} value={role!}>
        <Stack direction="column">
          <Radio value={UserRole.DONATOR}>Donator</Radio>
          <Radio value={UserRole.PICKUP}>Pickup</Radio>
          <Radio value={UserRole.RESTAURANT}>Restaurant</Radio>
        </Stack>
      </RadioGroup>
      <Button onClick={() => updateUser.mutate({ role: role! })}>Submit</Button>
    </Box>
  );
}
