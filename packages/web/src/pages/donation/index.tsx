import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import type { Donation, Ngo, Pickup, User } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useSocket } from '../../contexts/socket-provider';

type DonationData = Donation & {
  ngo: Ngo;
  donator: User;
  pickup: Pickup;
};

export default function Donations() {
  const router = useRouter();
  const { data: donations } = useQuery<DonationData[]>('/donations');
  const queryClient = useQueryClient();
  const socketRef = useSocket();

  return (
    <Flex flex={1} width="full" alignItems="flex-start" justifyContent="center">
      <Box w="full" my={8} mx={6} maxW="1100px">
        <Flex alignItems="center" justifyContent="space-between">
          <Heading>Donations</Heading>
          <Link href="/donation/contribute" passHref>
            <Button as="a">Contribute</Button>
          </Link>
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
            {donations?.map((donation, index) => (
              <Tr
                key={donation.id}
                onClick={() => router.push('')}
                _hover={{ bg: 'gray.50', cursor: 'pointer' }}
              >
                <Td>{index + 1}</Td>
                <Td>{donation.ngo.name}</Td>
                <Td>
                  <Tag>{donation.pickup.status}</Tag>
                </Td>
                <Td>{donation.donator.name}</Td>
                <Td>{donation.pickup.donatorLocation}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
}
