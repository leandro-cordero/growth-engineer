import { z } from 'zod';
import styles from './Hello.module.scss';

const HelloProps = z.object({ name: z.string().min(1) });
type HelloProps = z.infer<typeof HelloProps>;

export default function Hello(props: HelloProps) {
  const { name } = HelloProps.parse(props);
  return <h1 className={`text-3xl font-bold ${styles.title}`}>Hello, {name}</h1>;
}
