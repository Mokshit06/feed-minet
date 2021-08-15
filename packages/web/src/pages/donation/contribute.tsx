import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import type { Ngo } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import {
  Form,
  Formik,
  FormikHelpers,
  useField,
  useFormikContext,
} from 'formik';
import Head from 'next/head';
import React, { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import Field from '../../components/field';
import useLocation from '../../hooks/use-location';
import api from '../../lib/api';
import { useSocket } from '../../contexts/socket-provider';
import { useRouter } from 'next/router';

const initialValues = {
  ngoId: '',
  description: '',
  quantity: 1,
  location: '',
};

type Values = typeof initialValues;

export default function Donation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const location = useLocation();
  const socketRef = useSocket();
  const router = useRouter();
  const donation = useMutation(
    async ({
      ngoId,
      description,
      quantity,
      location,
      donationId,
    }: Values & { donationId: string }) =>
      api.post('/donation', {
        ngoId: ngoId !== 'nearest' ? ngoId : null,
        nearest: ngoId === 'nearest',
        description,
        quantity,
        location,
        donationId,
      }),
    {
      onSuccess(result) {
        queryClient.invalidateQueries('/auth/me');

        toast({
          title: 'Thanks for your donation!',
          description: `Your donation will be received by ${result.data.ngo}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
      onError(result: any) {
        toast({
          title: "Donation couldn't be processed",
          status: 'error',
          duration: 3000,
          isClosable: true,
          description: result.response.data?.message,
        });
      },
    }
  );

  const handleSubmit = async (
    values: Values,
    { setSubmitting }: FormikHelpers<Values>
  ) => {
    setSubmitting(true);
    const donationId = uuid();
    await donation.mutateAsync({
      description: values.description,
      ngoId: values.ngoId,
      quantity: values.quantity,
      location: values.location,
      donationId,
    });

    try {
      socketRef.current?.emit('pickup-request', {
        donationId,
      });
    } catch (error) {
      console.log(error);
    }

    setSubmitting(false);
    router.push(`/donation/${donationId}`);
  };

  return (
    <Flex flex={1} width="full" alignItems="center" justifyContent="center">
      <Head>
        <title>Do a Donation</title>
      </Head>
      <Box
        m={8}
        borderWidth={1}
        p={8}
        width="full"
        maxWidth={{ base: '380px', sm: '600px', md: '680px' }}
        borderRadius={4}
        textAlign="center"
        boxShadow="lg"
      >
        <Box my={2} textAlign="center">
          <Heading fontWeight="400">Donate food</Heading>
        </Box>
        <Box mt={4}>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            // validationSchema={createStoreSchema}
            component={DonationForm}
          />
        </Box>
      </Box>
    </Flex>
  );
}

function DonationForm() {
  const { isSubmitting, isValid } = useFormikContext<Values>();
  const { data: ngos } = useQuery<Ngo[]>('/ngo');
  const [descriptionInput, descriptionMeta, descriptionHelpers] =
    useField('description');
  const [quantityInput, quantityMeta, quantityHelpers] = useField('quantity');
  const [ngoIdInput, ngoIdMeta] = useField('ngoId');
  const [locationInput, locationMeta] = useField('location');

  return (
    <Form>
      <Field meta={ngoIdMeta} label="NGO">
        <Select placeholder="Select NGO" {...ngoIdInput}>
          <option value="nearest">Nearest NGO</option>
          {ngos?.map(ngo => (
            <option key={ngo.id}>{ngo.name}</option>
          ))}
        </Select>
      </Field>
      <Field meta={locationMeta} label="Location to pickup from">
        <Input {...locationInput} />
      </Field>
      <Field meta={descriptionMeta} label="Description of your donation">
        <Textarea
          value={descriptionInput.value}
          onChange={e => descriptionHelpers.setValue(e.target.value)}
        />
      </Field>
      <Field meta={quantityMeta} label="Number of plates">
        <NumberInput
          min={1}
          value={Number(quantityInput.value || 0)}
          onChange={(_, val) => quantityHelpers.setValue(val)}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </Field>
      <Box my={6} mb={0} textAlign="right">
        <Button
          isLoading={isSubmitting}
          disabled={isSubmitting || !isValid}
          type="submit"
          py={6}
        >
          Donate
        </Button>
      </Box>
    </Form>
  );
}
