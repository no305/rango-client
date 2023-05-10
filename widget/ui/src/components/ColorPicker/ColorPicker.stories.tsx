import React, { useState } from 'react';
import { ComponentMeta } from '@storybook/react';
import { ColorPicker, PropTypes } from './ColorPicker';

export default {
  title: 'Components/ColorPicker',
  component: ColorPicker,
  argTypes: {
    place: {
      name: 'place',
      control: { type: 'select' },
      options: ['top', 'bottom', 'left', 'right'],
      defaultValue: 'top',
    },
    placeholder: {
      name: 'placeholder',
      control: { type: 'text' },
      defaultValue: 'Choose a color',
    },
  },
} as ComponentMeta<typeof ColorPicker>;

export const Main = (args: PropTypes) => {
  const [color, setColor] = useState<string | undefined>('#5FA425');
  return (
    <div
      style={{
        height: 600,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ColorPicker
        {...args}
        color={color}
        onChangeColor={(color) => {
          console.log(color);
          setColor(color)}}
      />
    </div>
  );
};
