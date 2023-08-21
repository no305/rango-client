import type { PriceImpactWarningLevel } from 'src/components/PriceImpact/PriceImpact.types';

export type BaseProps = {
  chain: {
    displayName: string;
    image: string;
  };
  token: {
    displayName: string;
    image: string;
  };
  price: {
    value: string;
    usdValue?: string;
  };
  loading?: boolean;
  error?: boolean;
  disabled?: boolean;
  onClickToken: () => void;
};

type FromProps = {
  label: 'from';
  balance?: string;
  onSelectMaxBalance: () => void;
  onInputChange: (inputAmount: string) => void;
};

type ToProps = {
  label: 'to';
  percentageChange: string;
  warningLevel: PriceImpactWarningLevel;
};

type Common = {
  label: string;
};

export type SwapInputProps = BaseProps & (FromProps | ToProps | Common);
