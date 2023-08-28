import { styled } from '../../theme';

export const Container = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexDirection: 'column',
  gap: 10,
});

export const Header = styled('div', {
  display: 'flex',
  padding: 0,
  justifyContent: 'space-between',
  alignItems: 'center',
  alignSelf: 'stretch',
});

export const Main = styled('button', {
  background: '$neutral200',
  border: 'none',
  width: '100%',
  borderRadius: '$md',
  gap: 10,
  padding: 15,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '$surface600',
  },
});
