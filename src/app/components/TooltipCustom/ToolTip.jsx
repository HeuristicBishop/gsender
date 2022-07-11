import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip as MainToolTip } from 'app/components/Tooltip';

const Tooltip = ({ location, content, disabled, children, style, wrapperStyle }) => {
    return (
        <MainToolTip
            content={content}
            placement={location === 'default' ? 'bottom' : location}
            enterDelay={1000}
            disabled={disabled}
            tooltipStyle={style}
        >
            <div style={wrapperStyle}>
                {children}
            </div>
        </MainToolTip>
    );
};

Tooltip.propTypes = {
    location: PropTypes.string,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.func]),
    disabled: PropTypes.bool,
};

export default Tooltip;
