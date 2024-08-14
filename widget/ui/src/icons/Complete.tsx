import type { SvgIconPropsWithChildren } from '../components/SvgIcon/index.js';

import React, { createElement } from 'react';

import { SvgIcon } from '../components/SvgIcon/index.js';

function SvgComplete(props: SvgIconPropsWithChildren) {
  return createElement(
    SvgIcon,
    props,
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 24C9.62663 24 7.30655 23.2962 5.33316 21.9776C3.35977 20.6591 1.8217 18.7849 0.913451 16.5922C0.00519937 14.3995 -0.232441 11.9867 0.230582 9.65892C0.693604 7.33115 1.83649 5.19295 3.51472 3.51472C5.19295 1.83649 7.33115 0.693604 9.65892 0.230582C11.9867 -0.232441 14.3995 0.00519937 16.5922 0.913451C18.7849 1.8217 20.6591 3.35977 21.9776 5.33316C23.2962 7.30655 24 9.62663 24 12C23.9964 15.1815 22.731 18.2317 20.4813 20.4813C18.2317 22.731 15.1815 23.9964 12 24ZM5.24958 10.7467C5.02396 10.7461 4.80338 10.8134 4.61649 10.9398C4.42961 11.0663 4.28505 11.2459 4.20158 11.4556C4.11812 11.6652 4.09962 11.8951 4.14847 12.1153C4.19732 12.3356 4.31128 12.5361 4.47553 12.6908L9.38309 17.3238C9.59865 17.5247 9.88439 17.6329 10.1789 17.6253C10.4734 17.6178 10.7532 17.495 10.9582 17.2833L19.556 8.28277C19.7619 8.06674 19.8735 7.77777 19.8663 7.47942C19.8591 7.18108 19.7338 6.89781 19.5177 6.69192C19.3017 6.48603 19.0127 6.3744 18.7144 6.38157C18.416 6.38875 18.1328 6.51414 17.9269 6.73017L10.1144 14.9139L6.02363 11.0527C5.81479 10.856 5.5387 10.7466 5.25183 10.7467H5.24958Z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgComplete;
