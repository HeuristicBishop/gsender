/*
 * Copyright (C) 2021 Sienci Labs Inc.
 *
 * This file is part of gSender.
 *
 * gSender is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, under version 3 of the License.
 *
 * gSender is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with gSender.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Contact for information regarding this program and its license
 * can be sent through gSender@sienci.com or mailed to the main office
 * of Sienci Labs Inc. in Waterloo, Ontario, Canada.
 *
 */

import React from 'react';

import PropTypes from 'prop-types';

const Home = ({ fill, isMovement = false, disabled = false }) => {
    fill = (isMovement ? '#FFFFFF' : fill);
    fill = (disabled ? '#9ca3af' : fill);
    return (
        <svg
            version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px"
            y="0px" viewBox="0 0 1000 1000" enableBackground="new 0 0 1000 1000"
            xmlSpace="preserve"
        >
            <metadata> Svg Vector Icons : http://www.onlinewebfonts.com/icon </metadata>
            <g><g><path d="M850.1,559.3V851c0,10.5-3.8,19.7-11.5,27.4c-7.7,7.7-16.8,11.5-27.4,11.5H577.8V656.5H422.2v233.4H188.8c-10.5,0-19.7-3.8-27.4-11.5c-7.7-7.7-11.5-16.8-11.5-27.4V559.3c0-0.4,0.1-1,0.3-1.8s0.3-1.4,0.3-1.8L500,267.5l349.5,288.1C849.9,556.4,850.1,557.6,850.1,559.3L850.1,559.3z M985.7,517.3l-37.7,45c-3.2,3.6-7.5,5.9-12.8,6.7h-1.8c-5.3,0-9.5-1.4-12.8-4.3L500,214L79.4,564.7c-4.9,3.2-9.7,4.7-14.6,4.3c-5.3-0.8-9.5-3-12.8-6.7l-37.7-45c-3.2-4.1-4.7-8.8-4.3-14.3c0.4-5.5,2.6-9.8,6.7-13.1l437-364.1c13-10.5,28.4-15.8,46.2-15.8c17.8,0,33.2,5.3,46.2,15.8l148.3,124V131.3c0-5.7,1.8-10.3,5.5-14s8.3-5.5,14-5.5h116.7c5.7,0,10.3,1.8,14,5.5s5.5,8.3,5.5,14v248L983.2,490c4.1,3.2,6.3,7.6,6.7,13.1C990.3,508.5,988.9,513.3,985.7,517.3L985.7,517.3z" fill={fill} /></g></g>
        </svg>
    );
};

Home.propTypes = {
    fill: PropTypes.string,
    isMovement: PropTypes.bool
};

export default Home;
