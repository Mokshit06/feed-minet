import { GetServerSideProps } from 'next';
import { useSocket } from '../hooks/socket';

export default function Home() {
  return <div>Works</div>;
}

export const getServerSideProps: GetServerSideProps = async context => {
  return {
    props: {},
  };
};
