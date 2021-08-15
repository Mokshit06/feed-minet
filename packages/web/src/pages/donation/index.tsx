import {
  Box,
  Button,
  Flex,
  Heading,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Textarea,
} from '@chakra-ui/react';
import type { Ngo } from '@prisma/client';
import {
  Form,
  Formik,
  FormikHelpers,
  useField,
  useFormikContext,
} from 'formik';
import Head from 'next/head';
import React from 'react';
import { useMutation, useQuery } from 'react-query';
import Field from '../../components/field';
import api from '../../lib/api';

const initialValues = {
  ngoId: '',
  description: '',
  quantity: 0,
};

type Values = typeof initialValues;

export default function Donation() {
  const donation = useMutation(
    async ({
      ngoId,
      description,
      quantity,
    }: {
      ngoId: string;
      description: string;
      quantity: number;
    }) =>
      api.post('/donation', {
        ngoId: ngoId !== 'nearest' ? ngoId : null,
        nearest: ngoId === 'nearest',
        description,
        quantity,
      })
  );

  const handleSubmit = async (
    values: Values,
    { setSubmitting }: FormikHelpers<Values>
  ) => {};

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
  const { data: ngos } = useQuery<Ngo[]>('/ngos');
  const [descriptionInput, descriptionMeta, descriptionHelpers] =
    useField('description');
  const [quantityInput, quantityMeta, quantityHelpers] = useField('quantity');
  const [ngoIdInput, ngoIdMeta] = useField('ngoId');

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
