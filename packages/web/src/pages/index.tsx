import { GetServerSideProps } from 'next';

export default function Home() {
  return <div>Works</div>;
}

export const getServerSideProps: GetServerSideProps = async context => {
  return {
    props: {},
  };
};
