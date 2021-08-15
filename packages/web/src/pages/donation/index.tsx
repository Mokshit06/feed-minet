import { useQuery } from 'react-query';

export default function DonationList() {
  const { data: donations } = useQuery('/donation');

  return <pre>{JSON.stringify(donations, null, 2)}</pre>;
}
