import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';

import * as WebGL from 'app/lib/three/WebGL';
import { GRBL_ACTIVE_STATE_ALARM, GRBL_ACTIVE_STATE_HOLD, WORKFLOW_STATE_IDLE } from 'app/constants';
import Widget from 'app/components/Widget';
import ToggleSwitch from 'app/components/ToggleSwitch';
import UnlockButton from 'app/widgets/Visualizer/UnlockButton';
import WorkflowControl from './WorkflowControl';
import MachineStatusArea from './MachineStatusArea';
import ValidationModal from './ValidationModal';
import WarningModal from './WarningModal';
import Visualizer from './Visualizer';
import Loading from './Loading';
import Rendering from './Rendering';
import WatchDirectory from './WatchDirectory';
import { MODAL_WATCH_DIRECTORY } from './constants';
import styles from './index.styl';


const PrimaryVisualizer = ({
    actions,
    state,
    capable,
    showLoading,
    showRendering,
    showVisualizer,
    visualizerRef,
    workflowRef,
    widgetContentRef,
    modalList
}) => {
    const { liteMode, modal, cameraPosition, invalidLine, invalidGcode, alarmCode, activeState, workflow, isConnected } = state;
    const isHomingAlarm = activeState === GRBL_ACTIVE_STATE_ALARM && alarmCode === 'Homing'; // We are alarmed and
    const holdWithoutWorkflowPause = activeState === GRBL_ACTIVE_STATE_HOLD && workflow.state === WORKFLOW_STATE_IDLE;
    const showUnlockButton = isConnected && (isHomingAlarm || holdWithoutWorkflowPause);
    const { handleLiteModeToggle, handleRun, reset } = actions;

    const containerID = 'visualizer_container';

    return (
        <Widget className={styles.vizWidgetOverride}>
            <Widget.Header className={styles['visualizer-header']}>
                <Widget.Title>
                    Visualizer
                </Widget.Title>
                <Widget.Controls style={{ top: '-4px', display: 'flex', alignItems: 'center' }}>
                    <div>
                        {
                            Object.keys(modalList).length > 0 &&
                                (
                                    <div style={{ display: 'flex', gap: '2rem' }}>
                                        <span>Units: <strong>{modalList.units}</strong></span>{' '}
                                        <span>Motion: <strong>{modalList.motion}</strong></span>{' '}
                                        <span>Feedrate: <strong>{modalList.feedrate}</strong></span>{' '}
                                        <span>Plane: <strong>{modalList.plane}</strong></span>
                                    </div>
                                )
                        }
                    </div>
                    <ToggleSwitch
                        label="Lightweight Mode"
                        checked={liteMode}
                        onChange={() => handleLiteModeToggle()}
                        className={styles.litetoggle}
                        size="md"
                    />
                </Widget.Controls>
            </Widget.Header>
            <Widget.Content
                reference={widgetContentRef}
                className={classNames(
                    { [styles.view3D]: capable.view3D },
                    styles['visualizer-component'],
                )}
                id={containerID}
            >
                {showLoading &&
                <Loading />
                }
                {showRendering &&
                <Rendering />
                }
                {modal.name === MODAL_WATCH_DIRECTORY && (
                    <WatchDirectory
                        state={state}
                        actions={actions}
                    />
                )}

                {WebGL.isWebGLAvailable() && (
                    <div className={styles.visualizerWrapper}>
                        {
                            showUnlockButton && <UnlockButton />
                        }
                        <MachineStatusArea
                            state={state}
                            actions={actions}
                        />
                        <Visualizer
                            show={showVisualizer}
                            cameraPosition={cameraPosition}
                            ref={visualizerRef}
                            state={state}
                            actions={actions}
                            containerID={containerID}
                        />

                        <WorkflowControl
                            ref={workflowRef}
                            state={state}
                            actions={actions}
                            invalidGcode={invalidLine.line}
                        />


                        {
                            invalidGcode.shouldShow && invalidGcode.showModal && (
                                <ValidationModal
                                    invalidGcode={invalidGcode}
                                    onProceed={handleRun}
                                    onCancel={reset}
                                />
                            )
                        }
                        {
                            invalidLine.shouldShow && invalidLine.show && (
                                <WarningModal
                                    onContinue={actions.lineWarning.onContinue}
                                    onIgnoreWarning={actions.lineWarning.onIgnoreWarning}
                                    onCancel={actions.lineWarning.onCancel}
                                    invalidLine={invalidLine.line}
                                />
                            )
                        }
                    </div>
                )}
            </Widget.Content>
        </Widget>
    );
};

PrimaryVisualizer.propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
    capable: PropTypes.object,
    showLoading: PropTypes.bool,
    showRendering: PropTypes.bool,
    showVisualizer: PropTypes.bool,
    visualizerRef: PropTypes.func,
    workflowRef: PropTypes.func,
    widgetContentRef: PropTypes.func,
    containerID: PropTypes.string,
    modalList: PropTypes.object
};

export default connect((store) => {
    const modalList = get(store, 'controller.modal');

    return { modalList };
}, null, null, { forwardRef: true })(PrimaryVisualizer);
