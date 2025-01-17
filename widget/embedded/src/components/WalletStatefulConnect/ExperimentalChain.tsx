import { i18n } from '@lingui/core';
import { Button, Divider, MessageBox } from '@rango-dev/ui';
import React from 'react';

interface PropTypes {
  displayName?: string;
  onConfirm: () => void;
}

export function ExperimentalChain(props: PropTypes) {
  const { displayName, onConfirm } = props;

  return (
    <MessageBox
      title={i18n.t({
        id: 'Add {blockchainDisplayName} Chain',
        values: { blockchainDisplayName: displayName },
      })}
      type="warning"
      description={i18n.t({
        id: 'You should connect a {blockchainDisplayName} supported wallet or choose a different {blockchainDisplayName} address',
        values: { blockchainDisplayName: displayName },
      })}>
      <Divider size={18} />
      <Divider size={32} />
      <Button
        onClick={onConfirm}
        variant="outlined"
        type="primary"
        fullWidth
        size="large">
        {i18n.t('Confirm')}
      </Button>
    </MessageBox>
  );
}
