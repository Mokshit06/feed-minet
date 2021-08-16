import {
  Box,
  Heading,
  Stack,
  RadioGroup,
  Radio,
  Button,
  useToast,
  Image,
  Flex,
  Tag,
  Text,
  SimpleGrid,
} from '@chakra-ui/react';
import { useUser } from '../hooks/auth';
import { UserRole } from '@prisma/client';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import api from '../lib/api';
import Link from 'next/link';

export default function Dashboard() {
  const { isLoading, isError, data: user, isAuthenticated } = useUser();

  if (isLoading || isError || !user || !isAuthenticated) {
    return null;
  }

  if (!user.role) {
    return <ChooseRole />;
  }

  return (
    <Flex flex={1} width="full" alignItems="flex-start" justifyContent="center">
      <Box my={8} mx={4} maxW="700px" w="full">
        <Flex mb={8} gridGap="2rem" alignItems="center">
          <Image
            src={user.image!}
            rounded="md"
            boxShadow="lg"
            h="8rem"
            w="8rem"
            alt={user.name}
          />
          <Box>
            <Heading mb={3} fontSize="4xl" fontWeight="500">
              {user.name}
            </Heading>
            <Tag size="lg">
              <Text>{user.role}</Text>
            </Tag>
          </Box>
        </Flex>
        <SimpleGrid columns={2} spacing={10}>
          <Box boxShadow="md" px={6} py={4}>
            <Heading fontWeight="500" as="h3" fontSize="2xl">
              Total Donations
            </Heading>
            <Text fontSize="lg">{user.donations.length}</Text>
          </Box>
          <Box boxShadow="md" px={6} py={4}>
            <Heading fontWeight="500" as="h3" fontSize="2xl">
              Credits
            </Heading>
            {/* calc actual credits based on amount of food */}
            <Text fontSize="lg">
              {user.donations
                .map(d => d.quantity)
                .reduce((creds, quantity) => creds + quantity, 0) * 100}
            </Text>
          </Box>
          <Box boxShadow="md" px={6} py={4}>
            <Heading fontWeight="500" as="h3" fontSize="2xl">
              Address
            </Heading>
            <Text fontSize="lg">{user.address || 'Delhi'}</Text>
          </Box>
          <Box boxShadow="md" px={6} py={4}>
            <Heading fontWeight="500" as="h3" fontSize="2xl">
              Authenticated
            </Heading>
            <Text fontSize="lg">
              {user.provider[0].toUpperCase() +
                user.provider.slice(1).toLowerCase()}
            </Text>
          </Box>
          {user.role === UserRole.DONATOR ? (
            <>
              <Link passHref href="/donation">
                <Button
                  as="a"
                  size="lg"
                  h="5rem"
                  bgColor="gray.100"
                  px={8}
                  py={4}
                >
                  <Heading fontWeight="500" as="h3" fontSize="2xl">
                    Donations
                  </Heading>
                </Button>
              </Link>
              <Link href="/donation/contributre" passHref>
                <Button
                  as="a"
                  size="lg"
                  h="5rem"
                  bgColor="gray.100"
                  px={8}
                  py={4}
                >
                  <Heading fontWeight="500" as="h3" fontSize="2xl">
                    Contribute
                  </Heading>
                </Button>
              </Link>
            </>
          ) : user.role === UserRole.PICKUP ? (
            <>
              <Link passHref href="/pickups">
                <Button
                  as="a"
                  size="lg"
                  h="5rem"
                  bgColor="gray.100"
                  px={8}
                  py={4}
                >
                  <Heading fontWeight="500" as="h3" fontSize="2xl">
                    Pickups
                  </Heading>
                </Button>
              </Link>
              <Link href="/donation/contribute" passHref>
                <Button
                  as="a"
                  size="lg"
                  h="5rem"
                  bgColor="gray.100"
                  px={8}
                  py={4}
                >
                  <Heading fontWeight="500" as="h3" fontSize="2xl">
                    Contribute
                  </Heading>
                </Button>
              </Link>
            </>
          ) : user.role === UserRole.NGO ? (
            <>
              <Link passHref href="/ngo/register">
                <Button
                  as="a"
                  size="lg"
                  h="5rem"
                  bgColor="gray.100"
                  px={8}
                  py={4}
                >
                  <Heading fontWeight="500" as="h3" fontSize="2xl">
                    Register
                  </Heading>
                </Button>
              </Link>
              <Link href="/ngo" passHref>
                <Button
                  as="a"
                  size="lg"
                  h="5rem"
                  bgColor="gray.100"
                  px={8}
                  py={4}
                >
                  <Heading fontWeight="500" as="h3" fontSize="2xl">
                    Donations received
                  </Heading>
                </Button>
              </Link>
            </>
          ) : null}
        </SimpleGrid>
      </Box>
    </Flex>
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
          <Radio value={UserRole.NGO}>NGO</Radio>
        </Stack>
      </RadioGroup>
      <Button onClick={() => updateUser.mutate({ role: role! })}>Submit</Button>
    </Box>
  );
}
