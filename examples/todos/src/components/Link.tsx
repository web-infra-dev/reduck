import { PropsWithChildren } from 'react';

interface Props {
  active: boolean;
  onClick: () => void;
}

const Link = ({ active, children, onClick }: PropsWithChildren<Props>) => (
  <button
    onClick={onClick}
    disabled={active}
    style={{
      marginLeft: '4px',
    }}
  >
    {children}
  </button>
);

export default Link;
