import { FaGoogle, FaDiscord } from 'react-icons/fa';
import { Box, Button, Heading, Flex, Text, Stack } from '@chakra-ui/react';
import Head from 'next/head';
import { useLogin } from '../hooks/auth';

function Login() {
  const login = useLogin();

  return (
    <Flex flex={1} width="full" alignItems="center" justifyContent="center">
      <Head>Login | MINET</Head>
      <Box
        borderWidth={1}
        p={8}
        width="full"
        maxWidth={['380px', null, null, '430px', null]}
        borderRadius={4}
        textAlign="center"
        boxShadow="lg"
      >
        <Box my={2} textAlign="center">
          <Heading>Sign up</Heading>
          <Text mt={8}>
            Welcome back. Login to your account or create a new account.
          </Text>
        </Box>
        <Box mt={6} mb={4} textAlign="left">
          <Stack justifyContent="space-between">
            <Button
              leftIcon={<FaGoogle />}
              my={2}
              py={6}
              onClick={() => login()}
            >
              Login with Google
            </Button>
            {/* <Button
              leftIcon={<FaDiscord />}
              variant="outline"
              my={2}
              py={6}
              onClick={() => login()}
            >
              Login with Discord
            </Button> */}
          </Stack>
        </Box>
      </Box>
    </Flex>
  );
}

export default Login;
