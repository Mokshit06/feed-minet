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
  useToast,
} from '@chakra-ui/react';
import {
  Form,
  Formik,
  FormikHelpers,
  useField,
  useFormikContext,
} from 'formik';
import Head from 'next/head';
import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import Field from '../../components/field';
import useLocation from '../../hooks/use-location';
import api from '../../lib/api';

const initialValues = {
  name: '',
  numberOfPeople: 1,
  address: '',
};

type Values = typeof initialValues;

export default function RegisterNGO() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const donation = useMutation(
    async (values: Values) => api.post('/ngo/register', values),
    {
      onSuccess() {
        queryClient.invalidateQueries('/auth/me');

        toast({
          title: 'Your NGO has been registered!',
          description: `People can now donate to your NGO`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
      onError(result: any) {
        toast({
          title: "NGO couldn't be created",
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

    donation.mutate({
      address: values.address,
      name: values.name,
      numberOfPeople: values.numberOfPeople,
    });

    setSubmitting(false);
  };

  return (
    <Flex flex={1} width="full" alignItems="center" justifyContent="center">
      <Head>
        <title>Register NGO</title>
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
          <Heading fontWeight="400">Register your NGO</Heading>
        </Box>
        <Box mt={4}>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            // validationSchema={createStoreSchema}
            component={NGOForm}
          />
        </Box>
      </Box>
    </Flex>
  );
}

function NGOForm() {
  const { isSubmitting, isValid } = useFormikContext<Values>();
  const [addressInput, addressMeta] = useField('address');
  const [nameInput, nameMeta] = useField('name');
  const [numberOfPeopleInput, numberOfPeopleMeta, numberOfPeopleHelpers] =
    useField('numberOfPeople');

  return (
    <Form>
      <Field meta={nameMeta} label="Name of NGO">
        <Input {...nameInput} />
      </Field>
      <Field
        meta={addressMeta}
        label="Address of NGO (used to deliver donations)"
      >
        <Input {...addressInput} />
      </Field>
      <Field meta={numberOfPeopleMeta} label="Number of people living in NGO">
        <NumberInput
          min={1}
          value={Number(numberOfPeopleInput.value || 0)}
          onChange={(_, val) => numberOfPeopleHelpers.setValue(val)}
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
          Register
        </Button>
      </Box>
    </Form>
  );
}
