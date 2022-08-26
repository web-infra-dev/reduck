import { useModel } from '@modern-js-reduck/react';
import { PropsWithChildren } from 'react';
import Link from '../components/Link';
import todos, { VisibilityFilters } from '../models/todos';

interface Props {
  filter: VisibilityFilters;
}

const FilterLink = (props: PropsWithChildren<Props>) => {
  const { filter, children } = props;
  const [{ visibilityFilter }, { setVisibilityFilter }] = useModel(todos);

  // won't re-render when only the `data` slice of state change,
  // because the state selector lets `FilterLink` only subscribe the `visibilityFilter` slice of the state
  // const [visibilityFilter, {setVisibilityFilter}] = useModel(todos, (state) => state.visibilityFilter)

  return (
    <Link
      active={visibilityFilter === filter}
      onClick={() => setVisibilityFilter(filter)}
    >
      {children}
    </Link>
  );
};

export default FilterLink;
