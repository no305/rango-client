import { styled } from '../../theme';

export const Container = styled('div', {
  position: 'relative',
  padding: '0 0.5rem',
  boxSizing: 'border-box',
  border: '1px solid transparent',
  variants: {
    type: {
      'route-details': { border: 'none' },
      'route-progress': {
        backgroundColor: '$surface200',
        borderRadius: '$xm',
        padding: '$10 $15',
        marginBottom: '25px',
      },
    },
    state: {
      default: {
        borderColor: '$neutral600',
      },
      'in-progress': { borderColor: '$info' },
      completed: {
        borderColor: '$success',
      },
      warning: { borderColor: '$warning' },
      error: { borderColor: '$error' },
    },
  },
  '& .swapper': {
    display: 'flex',
    alignItems: 'center',
  },
  '& .swapper__description': {
    fontWeight: '$medium',
  },
  '& .step-info': {
    display: 'flex',
    flex: '1',
    width: '100%',
    alignItems: 'start',
    variants: {
      tx: {
        true: {
          paddingLeft: '36px',
        },
      },
    },
  },
  '& div:nth-child(3)': { display: 'flex', flexDirection: 'column', flex: 1 },
  '& .tokens-container': { width: '100%' },
  '& .tokens': {
    display: 'flex',
    paddingTop: '$5',
    paddingBottom: '$10',
    alignItems: 'center',
  },
});

export const SwapperImage = styled('div', {
  borderRadius: '100%',
  width: 'max-content',
  height: 'max-content',
  overflow: 'hidden',
  border: '1.5px solid transparent',
  variants: {
    state: {
      default: {
        borderColor: '$neutral600',
      },
      'in-progress': { borderColor: '$info' },
      completed: {
        borderColor: '$success',
      },
      warning: { borderColor: '$warning' },
      error: { borderColor: '$error' },
    },
  },
});

export const Alerts = styled('div', {
  width: '100%',
  variants: {
    pb: {
      true: {
        paddingBottom: '35px',
      },
    },
  },
});

export const DashedLine = styled('div', {
  borderLeft: '1px dashed black',
  minHeight: '64px',
  margin: '0 11.5px',
  alignSelf: 'stretch',
  variants: {
    invisible: {
      true: {
        visibility: 'hidden',
        minHeight: 'unset',
      },
    },
  },
});

export const StepSeparator = styled('div', {
  borderLeft: '1px dashed transparent',
  margin: '0 $10',
  alignSelf: 'stretch',
  display: 'block',
  height: '25px',
  position: 'absolute',
  top: '-26px',
  left: '16px',
  variants: {
    state: {
      default: {
        borderColor: '$neutral600',
      },
      'in-progress': { borderColor: '$info' },
      completed: {
        borderColor: '$success',
      },
      warning: { borderColor: '$warning' },
      error: { borderColor: '$error' },
    },
  },
});
