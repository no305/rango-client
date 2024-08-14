import type { SvgIconPropsWithChildren } from '../components/SvgIcon/index.js';

import React, { createElement } from 'react';

import { SvgIcon } from '../components/SvgIcon/index.js';

function SvgReport(props: SvgIconPropsWithChildren) {
  return createElement(
    SvgIcon,
    props,
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        d="M13.5783 0H4.98897C4.9378 0 4.8884 0.0211734 4.85135 0.0564623L2.05646 2.85311C2.01941 2.89016 2 2.93957 2 2.99074V13.5192V15.1548C2 15.6206 2.37936 16 2.84517 16H13.5783C14.0441 16 14.4235 15.6206 14.4235 15.1548V0.84517C14.4235 0.379356 14.0441 0 13.5783 0ZM4.79488 0.665196V2.5408C4.79488 2.68196 4.68019 2.79488 4.5408 2.79488H2.6652L4.79488 0.665196ZM14.0335 15.1548C14.0335 15.4054 13.8288 15.6101 13.5783 15.6101H2.84341C2.59285 15.6101 2.38818 15.4054 2.38818 15.1548V13.5192V3.18483H4.53904C4.89369 3.18483 5.18306 2.89546 5.18306 2.5408V0.389943H13.5765C13.8271 0.389943 14.0318 0.594618 14.0318 0.84517V15.1548H14.0335ZM12.9025 9.00044C12.9025 9.10807 12.8143 9.19629 12.7067 9.19629H3.71504C3.60741 9.19629 3.51919 9.10807 3.51919 9.00044C3.51919 8.89281 3.60741 8.80459 3.71504 8.80459H12.7084C12.8143 8.80459 12.9025 8.89281 12.9025 9.00044ZM12.9025 10.3944C12.9025 10.502 12.8143 10.5902 12.7067 10.5902H3.71504C3.60741 10.5902 3.51919 10.502 3.51919 10.3944C3.51919 10.2867 3.60741 10.1985 3.71504 10.1985H12.7084C12.8143 10.1985 12.9025 10.2867 12.9025 10.3944ZM12.9025 11.7865C12.9025 11.8941 12.8143 11.9824 12.7067 11.9824H3.71504C3.60741 11.9824 3.51919 11.8941 3.51919 11.7865C3.51919 11.6789 3.60741 11.5906 3.71504 11.5906H12.7084C12.8143 11.5924 12.9025 11.6789 12.9025 11.7865ZM9.83591 13.1804C9.83591 13.288 9.74768 13.3763 9.64005 13.3763H3.71504C3.60741 13.3763 3.51919 13.288 3.51919 13.1804C3.51919 13.0728 3.60741 12.9846 3.71504 12.9846H9.64182C9.74945 12.9846 9.83591 13.0728 9.83591 13.1804ZM4.3079 7.28011H12.112C12.2197 7.28011 12.3079 7.19188 12.3079 7.08425C12.3079 6.97662 12.2197 6.8884 12.112 6.8884H11.7539V3.03485C11.7539 2.809 11.5704 2.6255 11.3445 2.6255H10.1006C9.87473 2.6255 9.69122 2.809 9.69122 3.03485V3.63652H8.42612C8.20027 3.63652 8.01676 3.82003 8.01676 4.04588V4.64755H6.75166C6.52581 4.64755 6.3423 4.83105 6.3423 5.0569V5.65858H5.0772C4.85135 5.65858 4.66784 5.84208 4.66784 6.06793V6.88487H4.30966C4.20203 6.88487 4.11381 6.97309 4.11381 7.08072C4.11381 7.18836 4.20026 7.28011 4.3079 7.28011ZM10.1006 3.01544H11.3445C11.3551 3.01544 11.3639 3.02426 11.3639 3.03485V6.89016H10.0812V3.03485C10.0812 3.02426 10.09 3.01544 10.1006 3.01544ZM8.42612 4.02647H9.69122V6.8884H8.40671V4.04764C8.40671 4.03705 8.41553 4.02647 8.42612 4.02647ZM6.75166 5.03926H8.01676V6.8884H6.73225V5.06043C6.73048 5.04985 6.74107 5.03926 6.75166 5.03926ZM5.05602 6.07323C5.05602 6.06264 5.06484 6.05382 5.07543 6.05382H6.34054V6.89193H5.05602V6.07323Z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgReport;
