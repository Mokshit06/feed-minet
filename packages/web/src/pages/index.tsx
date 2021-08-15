import { GetServerSideProps } from 'next';
import { useSocket } from '../contexts/socket-provider';

export default function Home() {
  return <div>Works</div>;
}

export const getServerSideProps: GetServerSideProps = async context => {
  return {
    props: {},
  };
};
