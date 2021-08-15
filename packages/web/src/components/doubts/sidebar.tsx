import {
  Avatar,
  Box,
  Button,
  Flex,
  Spacer,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useAtom } from 'jotai';
// import useChats from 'contexts/ChatsProvider';
import { useUser } from '../../hooks/auth';
import { roomsAtom, selectedRoomIdAtom } from '../../hooks/chat';
// import { Room } from 'interfaces';
import ChatModal from './modal';

export default function Sidebar() {
  // const { rooms } = useChats();
  const [rooms] = useAtom(roomsAtom);
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <Flex
      minW="300px"
      boxShadow="lg"
      flexDir="column"
      height="calc(100vh - 82px)"
    >
      {rooms.map((room, index) => (
        <SidebarItem room={room} index={index} key={room.id} />
      ))}
      <Spacer />
      <Box m={3}>
        <Button width="full" size="lg" onClick={onOpen}>
          Create Room
        </Button>
      </Box>
      <ChatModal isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
}

interface SidebarItemProps {
  // room: Room;
  room: any;
  index: number;
}

function SidebarItem({ room, index }: SidebarItemProps) {
  // rename to id
  const [selectedRoomIndex, setSelectedRoomIndex] = useAtom(selectedRoomIdAtom);
  const { data: user } = useUser();
  const recipient = room.users.filter(u => u.id !== user!.id)[0];
  const isSelected = selectedRoomIndex === index;
  const hoverColor = useColorModeValue('#edf2f7', '#ffffff14');
  const selectedColor = useColorModeValue('#E2E8F0', '#ffffff29');

  return recipient ? (
    <Box width="full" px={2} pt={2}>
      <Flex
        as={Button}
        width="full"
        py={8}
        px={5}
        alignItems="center"
        bgColor={isSelected ? selectedColor : 'transparent'}
        _hover={{ background: hoverColor }}
        justifyContent="flex-start"
        onClick={() => setSelectedRoomIndex(index)}
      >
        <Avatar size="md" name={recipient.name} mr={5} src={recipient.image} />
        <Text
          fontSize="1.1rem"
          fontWeight={500}
          display="flex"
          justifyContent="flex-start"
          isTruncated
          flex={1}
        >
          {recipient.name}
        </Text>
      </Flex>
    </Box>
  ) : null;
}
