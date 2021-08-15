import Link from '../../components/link';
import {
  Box,
  Flex,
  Heading,
  Table,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Button,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import type { Ngo, Donation, Pickup, User } from '@prisma/client';
import { useQuery, useQueryClient } from 'react-query';
import { useSocket } from '../../contexts/socket-provider';
import { useEffect } from 'react';

type PickupData = Donation & {
  ngo: Ngo;
  donator: User;
  pickup: Pickup;
};

export default function StoreProducts() {
  const router = useRouter();
  const storeId = router.query.storeId as string;
  const { data: pickups } = useQuery<PickupData[]>('/pickup');
  const queryClient = useQueryClient();
  const socketRef = useSocket();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on('pickup-alert', () => {
      console.log('ALERT');
    });
  }, [socketRef]);

  return (
    <Flex flex={1} width="full" alignItems="flex-start" justifyContent="center">
      <Box w="full" my={8} mx={6} maxW="1100px">
        <Flex alignItems="center" justifyContent="flex-start">
          <Heading>Pickups</Heading>
        </Flex>
        <Table mt={6} rounded="sm" boxShadow="md" variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>NGO</Th>
              <Th>Status</Th>
              <Th>Donator</Th>
              <Th>Location</Th>
            </Tr>
          </Thead>
          <Tbody>
            {pickups?.map((pickup, index) => (
              <Tr
                key={pickup.id}
                onClick={() => router.push('')}
                _hover={{ bg: 'gray.50', cursor: 'pointer' }}
              >
                <Td>{index + 1}</Td>
                <Td>{pickup.ngo.name}</Td>
                <Td>
                  <Tag>{pickup.pickup.status}</Tag>
                </Td>
                <Td>{pickup.donator.name}</Td>
                <Td>{pickup.pickup.donatorLocation}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
}
