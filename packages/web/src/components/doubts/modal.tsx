import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
} from '@chakra-ui/react';
// import useChats from 'contexts/ChatsProvider';
// import { useChatSelectOptions } from 'hooks/api-hooks';
import { useRef, useState } from 'react';
import { useUser } from '../../hooks/auth';
import { useCreateRoom, useJoinRoom } from '../../hooks/chat';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ onClose, isOpen }: ChatModalProps) {
  const initialRef = useRef<HTMLSelectElement>(null);
  const [selectedParticipant, setSelectedTeacher] = useState('');
  // const { joinRoom } = useChats();
  const { data: user } = useUser();
  const joinRoom = useJoinRoom();
  const createRoom = useCreateRoom();
  // const { data } = useChatSelectOptions();

  const handleCreate = () => {
    if (!selectedParticipant) return;

    createRoom([user!.id, selectedParticipant]);

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      initialFocusRef={initialRef}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Talk to a teacher</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          If you have any doubts related to your studies, you can talk to one of
          your teachers
          <Select
            ref={initialRef}
            mt={6}
            placeholder="Select the teacher"
            variant="filled"
            value={selectedParticipant}
            onChange={e => setSelectedTeacher(e.target.value)}
          >
            {/* {data?.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))} */}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleCreate}>Create Room</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
