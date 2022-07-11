import React from 'react';

import SettingWrapper from '../components/SettingWrapper';
import GeneralArea from '../components/GeneralArea';
import Fieldset from '../components/Fieldset';
import Input from '../components/Input';

const Terminal = ({ active, state, actions }) => {
    const { nLinesToCopy } = state.terminal;

    return (
        <SettingWrapper title="Terminal" show={active}>
            <GeneralArea>
                <GeneralArea.Half>
                    <Fieldset legend="Terminal Options">
                        <Input
                            label="Number of Lines to Copy"
                            onChange={(e) => actions.terminal.updateCopyLines(e.target.value)}
                            additionalProps={{ type: 'number', id: 'nLinesToCopy' }}
                            value={nLinesToCopy}
                        />
                    </Fieldset>
                </GeneralArea.Half>
            </GeneralArea>
        </SettingWrapper>
    );
};

export default Terminal;
