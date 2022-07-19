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
import styles from '../../index.styl';
import ReconnectButton from './ReconnectButton';

const NotConnectedWarning = ({ onReconnectClick }) => {
    return (
        <div className={styles.notConnectedWrapper}>
            <h1 className={styles.warningHeader}>You must be connected to change the GRBL EEPROM settings.</h1>
            <p className={styles.warningExplanation}>
                Connect to your last connected device using the button below or exit this window and connect to a different device.
            </p>
            <ReconnectButton onClick={onReconnectClick} />
        </div>
    );
};

export default NotConnectedWarning;
