import type { SvgIconPropsWithChildren } from '../components/SvgIcon';

import React, { createElement } from 'react';

import { SvgIcon } from '../components/SvgIcon';

function SvgNoRoute(props: SvgIconPropsWithChildren) {
  return createElement(
    SvgIcon,
    props,
    <svg viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.0304 2.4375V3.12441C16.0304 2.4375 16.0301 2.4375 16.0304 2.4375L16.0319 2.4375L16.0337 2.43751L16.0383 2.43753L16.0514 2.43769C16.0618 2.43785 16.0757 2.43815 16.0928 2.43869C16.1269 2.43978 16.174 2.44185 16.2323 2.44582C16.3486 2.45373 16.5106 2.46924 16.7041 2.49975C17.0884 2.56031 17.612 2.6823 18.1526 2.93156C19.2617 3.44284 20.4302 4.49412 20.5947 6.51644L20.5969 6.54424V12.2916H19.2231V6.60106C19.0998 5.19398 18.3333 4.52763 17.5775 4.17918C17.1833 3.99747 16.7896 3.90398 16.4902 3.85681C16.342 3.83344 16.2206 3.82201 16.139 3.81646C16.1049 3.81414 16.0779 3.81286 16.0591 3.81215C14.4249 3.99225 13.6604 4.74826 13.2775 5.40608C13.0756 5.7529 12.9692 6.09267 12.9139 6.34615C12.8864 6.47201 12.8721 6.57383 12.8648 6.64072C12.8612 6.67407 12.8593 6.69844 12.8584 6.71244L12.858 6.71956V16.88L12.8557 16.9078C12.6915 18.9309 11.5302 19.9824 10.4243 20.4932C9.88568 20.7421 9.36417 20.8632 8.98144 20.9231C8.78867 20.9532 8.62727 20.9684 8.51139 20.9761C8.45335 20.9799 8.40642 20.9819 8.37236 20.9829C8.35532 20.9834 8.34147 20.9837 8.33102 20.9838L8.31792 20.9839L8.31333 20.9839H8.31153C6.00027 20.9881 4.73082 20.0094 4.08107 18.9328C3.76952 18.4165 3.61648 17.9054 3.54043 17.527C3.50215 17.3366 3.4826 17.1759 3.47258 17.0595C3.46756 17.0012 3.46489 16.9536 3.46348 16.9186C3.46278 16.901 3.46239 16.8866 3.46217 16.8755L3.46196 16.8613L3.46192 16.8561L3.46192 16.854C3.46192 16.8535 3.46191 16.8522 4.14882 16.8522H3.46191V12.2916H4.83572V16.8488L4.83619 16.8634C4.83681 16.8789 4.83821 16.9055 4.84132 16.9416C4.84756 17.0141 4.86053 17.1231 4.8873 17.2563C4.94134 17.5252 5.04848 17.8769 5.2573 18.2229C5.64805 18.8704 6.46017 19.614 8.3103 19.6101L8.31297 19.6101L8.3316 19.6097C8.3501 19.6091 8.38034 19.6079 8.42071 19.6053C8.50165 19.5999 8.62205 19.5888 8.76918 19.5658C9.06627 19.5193 9.45701 19.4268 9.84817 19.2461C10.5972 18.9001 11.3607 18.2353 11.4842 16.8233V6.68664L12.1711 6.70407C11.4844 6.68664 11.4842 6.68706 11.4842 6.68664L11.4844 6.68491L11.4845 6.68287L11.4847 6.6779L11.4852 6.66444C11.4857 6.65392 11.4864 6.64034 11.4874 6.62387C11.4896 6.59096 11.4931 6.54642 11.4991 6.4918C11.511 6.38273 11.5325 6.23231 11.5717 6.05306C11.6496 5.6963 11.7995 5.21429 12.0902 4.71496C12.6891 3.68608 13.8445 2.65953 15.9599 2.44113L15.9951 2.4375H16.0304ZM12.8576 6.72561C12.8576 6.7264 12.8576 6.72625 12.8576 6.72561V6.72561Z"
        fill="currentColor"
      />
      <mask
        id="mask0_3736_40141"
        style={{
          maskType: 'alpha',
        }}
        maskUnits="userSpaceOnUse"
        x={3}
        y={2}
        width={20}
        height={19}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.11822 18.3546L21.1163 2.88989L22.7441 4.78442L4.74609 20.2491L3.11822 18.3546Z"
          fill="black"
        />
      </mask>
      <g mask="url(#mask0_3736_40141)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.0251 2.43726V3.12416C16.0251 2.43726 16.0247 2.43726 16.0251 2.43726L16.0265 2.43726L16.0283 2.43726L16.0329 2.43729L16.046 2.43744C16.0564 2.4376 16.0703 2.4379 16.0874 2.43845C16.1216 2.43953 16.1686 2.44161 16.2269 2.44557C16.3432 2.45349 16.5052 2.469 16.6988 2.4995C17.083 2.56006 17.6066 2.68206 18.1473 2.93132C19.2563 3.4426 20.4248 4.49387 20.5893 6.5162L20.5916 6.54399V12.2913H19.2177V6.60081C19.0944 5.19374 18.328 4.52739 17.5721 4.17894C17.178 3.99723 16.7842 3.90374 16.4849 3.85656C16.3366 3.83319 16.2153 3.82177 16.1336 3.81622C16.0995 3.81389 16.0725 3.81261 16.0537 3.81191C14.4195 3.992 13.655 4.74801 13.2721 5.40584C13.0703 5.75266 12.9638 6.09243 12.9085 6.3459C12.881 6.47177 12.8667 6.57358 12.8594 6.64047C12.8558 6.67382 12.8539 6.69819 12.853 6.71219L12.8526 6.71932V16.8798L12.8504 16.9075C12.6861 18.9307 11.5248 19.9821 10.4189 20.493C9.88031 20.7418 9.3588 20.863 8.97606 20.9228C8.7833 20.953 8.6219 20.9682 8.50602 20.9758C8.44798 20.9797 8.40105 20.9816 8.36699 20.9827C8.34995 20.9832 8.3361 20.9834 8.32565 20.9836L8.31255 20.9837L8.30796 20.9837H8.30616C5.9949 20.9878 4.72545 20.0092 4.0757 18.9325C3.76415 18.4163 3.61111 17.9052 3.53506 17.5268C3.49678 17.3363 3.47723 17.1757 3.46721 17.0593C3.46218 17.0009 3.45952 16.9534 3.45811 16.9183C3.45741 16.9008 3.45702 16.8863 3.4568 16.8752L3.45659 16.861L3.45655 16.8558L3.45655 16.8537C3.45654 16.8533 3.45654 16.8519 4.14345 16.8519H3.45654V12.2913H4.83035V16.8486L4.83082 16.8631C4.83144 16.8787 4.83284 16.9053 4.83595 16.9414C4.84219 17.0138 4.85516 17.1229 4.88193 17.2561C4.93597 17.5249 5.04311 17.8767 5.25193 18.2227C5.64268 18.8702 6.4548 19.6137 8.30493 19.6099L8.3076 19.6099L8.32623 19.6094C8.34473 19.6089 8.37497 19.6077 8.41534 19.605C8.49628 19.5997 8.61667 19.5885 8.76381 19.5655C9.0609 19.5191 9.45164 19.4265 9.8428 19.2458C10.5918 18.8998 11.3553 18.2351 11.4788 16.8231V6.68639L12.1657 6.70383C11.479 6.6864 11.4788 6.68681 11.4788 6.68639L11.4791 6.68466L11.4791 6.68263L11.4793 6.67766L11.4798 6.6642C11.4803 6.65368 11.481 6.64009 11.4821 6.62363C11.4842 6.59071 11.4877 6.54618 11.4937 6.49155C11.5056 6.38249 11.5272 6.23207 11.5663 6.05282C11.6442 5.69606 11.7942 5.21405 12.0848 4.71472C12.6837 3.68583 13.8391 2.65928 15.9545 2.44089L15.9897 2.43726H16.0251ZM12.8523 6.72537C12.8522 6.72615 12.8522 6.726 12.8523 6.72537V6.72537Z"
          fill="#FDFDFD"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.8206 3.10254C23.0453 3.36412 23.0155 3.75838 22.7539 3.98314L2.76815 21.1558C2.50657 21.3805 2.11231 21.3507 1.88755 21.0891C1.66279 20.8275 1.69264 20.4333 1.95422 20.2085L21.94 3.03587C22.2016 2.81111 22.5958 2.84096 22.8206 3.10254Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.908 12.7864C19.0532 12.7864 18.3601 13.4794 18.3601 14.3343C18.3601 15.1892 19.0532 15.8822 19.908 15.8822C20.7629 15.8822 21.4559 15.1892 21.4559 14.3343C21.4559 13.4794 20.7629 12.7864 19.908 12.7864ZM16.9863 14.3343C16.9863 12.7207 18.2944 11.4126 19.908 11.4126C21.5216 11.4126 22.8297 12.7207 22.8297 14.3343C22.8297 15.9479 21.5216 17.256 19.908 17.256C18.2944 17.256 16.9863 15.9479 16.9863 14.3343Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.14924 8.31766C3.29436 8.31766 2.60135 9.01067 2.60135 9.86555C2.60135 10.7204 3.29436 11.4134 4.14924 11.4134C5.00412 11.4134 5.69713 10.7204 5.69713 9.86555C5.69713 9.01067 5.00412 8.31766 4.14924 8.31766ZM1.22754 9.86555C1.22754 8.25194 2.53563 6.94385 4.14924 6.94385C5.76285 6.94385 7.07094 8.25194 7.07094 9.86555C7.07094 11.4792 5.76285 12.7873 4.14924 12.7873C2.53563 12.7873 1.22754 11.4792 1.22754 9.86555Z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgNoRoute;