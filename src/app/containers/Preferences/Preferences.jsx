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

import Modal from 'app/components/Modal';
import React, { PureComponent } from 'react';
import pubsub from 'pubsub-js';
import _ from 'lodash';
import controller from 'app/lib/controller';
import Events from 'app/containers/Preferences/ToolChange';
import ProgramEvents from 'app/containers/Preferences/Events';
import gamepad from 'app/lib/gamepad';
import { METRIC_UNITS, TERMINAL_MAX_LINES_TO_COPY } from 'app/constants';

import { Toaster, TOASTER_SUCCESS } from '../../lib/toaster/ToasterLib';
import General from './General';
import Shortcuts from './Keybindings';
import Terminal from './Terminal';
import ProbeSettings from './Probe';
import SpindleLaser from './SpindleLaser';
import WidgetConfig from '../../widgets/WidgetConfig';
import VisualizerSettings from './Visualizer';
import About from './About';
import store from '../../store';
import styles from './index.styl';
import { convertToImperial, convertToMetric } from './calculate';
import { CUST_LIGHT_THEME, DARK_THEME, DARK_THEME_VALUES, LIGHT_THEME, LIGHT_THEME_VALUES } from '../../widgets/Visualizer/constants';


class PreferencesPage extends PureComponent {
    probeConfig = new WidgetConfig('probe');

    visualizerConfig = new WidgetConfig('visualizer');

    spindleConfig = new WidgetConfig('spindle');

    state = this.getInitialState();

    showToast = _.throttle(() => {
        Toaster.pop({
            msg: 'Settings Updated',
            type: TOASTER_SUCCESS,
            duration: 3000
        });
    }, 3000, { trailing: false });

    getInitialState() {
        return {
            selectedMenu: 0,
            units: store.get('workspace.units', METRIC_UNITS),
            reverseWidgets: store.get('workspace.reverseWidgets', false),
            autoReconnect: store.get('widgets.connection.autoReconnect', false),
            baudrate: store.get('widgets.connection.baudrate', 115200),
            safeRetractHeight: store.get('workspace.safeRetractHeight', 10),
            controller: {
                type: controller.type,
                settings: controller.settings,
                state: controller.state
            },
            menu: [
                {
                    id: 0,
                    label: 'General',
                    component: General
                },
                {
                    id: 2,
                    label: 'Probe',
                    component: ProbeSettings
                },
                {
                    id: 3,
                    label: 'Shortcuts',
                    component: Shortcuts
                },
                {
                    id: 4,
                    label: 'Visualizer',
                    component: VisualizerSettings
                },
                {
                    id: 1,
                    label: 'Spindle/Laser',
                    component: SpindleLaser
                },
                {
                    id: 5,
                    label: 'Tool Change',
                    component: Events
                },
                {
                    id: 6,
                    label: 'Terminal',
                    component: Terminal
                },
                {
                    id: 7,
                    label: 'Start/Stop G-Code',
                    component: ProgramEvents,
                },
                {
                    id: 8,
                    label: 'About',
                    component: About,
                }
            ],
            tools: store.get('workspace[tools]', []),
            tool: {
                metricDiameter: 0,
                imperialDiameter: 0,
                type: 'end mill'
            },
            probe: store.get('workspace[probeProfile]'),
            probeSettings: {
                retractionDistance: this.probeConfig.get('retractionDistance', {}),
                normalFeedrate: this.probeConfig.get('probeFeedrate', {}),
                fastFeedrate: this.probeConfig.get('probeFastFeedrate', {}),
                probeCommand: this.probeConfig.get('probeCommand', 'G38.2'),
                connectivityTest: this.probeConfig.get('connectivityTest', true)
            },
            laser: {
                ...this.spindleConfig.get('laser')
            },
            spindle: {
                ...this.spindleConfig.get()
            },
            visualizer: {
                minimizeRenders: this.visualizerConfig.get('minimizeRenders'),
                theme: this.visualizerConfig.get('theme'),
                objects: this.visualizerConfig.get('objects'),
                disabled: this.visualizerConfig.get('disabled'),
                disabledLite: this.visualizerConfig.get('disabledLite')
            },
            terminal: {
                nLinesToCopy: store.get('workspace.terminal.nLinesToCopy'),
            },
            showWarning: store.get('widgets.visualizer.showWarning'),
            showLineWarnings: store.get('widgets.visualizer.showLineWarnings', 50),
        };
    }

    actions = {
        setSelectedMenu: (index) => {
            this.setState({
                selectedMenu: index
            });
        },
        general: {
            setSafeRetractHeight: (e) => {
                const value = Math.abs(Number(e.target.value));
                this.setState({
                    safeRetractHeight: value
                });
                pubsub.publish('safeHeight:update', value);
            },
            setUnits: (units) => {
                this.setState({
                    units: units
                }, this.convertUnits());
                pubsub.publish('units:change', units);
            },
            setReverseWidgets: () => {
                const reverseWidgetState = !this.state.reverseWidgets;
                this.setState({
                    reverseWidgets: reverseWidgetState
                });
                pubsub.publish('widgets:reverse', reverseWidgetState);
            },
            setAutoReconnect: () => {
                const autoReconnect = !this.state.autoReconnect;
                this.setState({
                    autoReconnect: autoReconnect
                });
                pubsub.publish('autoReconnect:update', autoReconnect);
            },
            setBaudrate: (option) => {
                this.setState({
                    baudrate: option.value
                });
                pubsub.publish('baudrate:update', option.value);
            },
            setShowWarning: (shouldShow) => {
                store.set('widgets.visualizer.showWarning', shouldShow);
                this.setState({ showWarning: shouldShow });
                pubsub.publish('gcode:showWarning', shouldShow);
            },
            setShowLineWarnings: (shouldShow) => {
                store.set('widgets.visualizer.showLineWarnings', shouldShow);
                this.setState({ showLineWarnings: shouldShow });
                pubsub.publish('gcode:showLineWarnings', shouldShow);
            },
        },
        tool: {
            setImperialDiameter: (e) => {
                const diameter = Number(e.target.value);
                const metricDiameter = convertToMetric(diameter);
                const tool = this.state.tool;
                this.setState({
                    tool: {
                        ...tool,
                        metricDiameter: metricDiameter,
                        imperialDiameter: diameter,
                    }
                });
            },
            setMetricDiameter: (e) => {
                const diameter = Number(e.target.value);
                const imperialDiameter = convertToImperial(diameter);
                const tool = this.state.tool;
                this.setState({
                    tool: {
                        ...tool,
                        metricDiameter: diameter,
                        imperialDiameter: imperialDiameter,
                    }
                });
            },
            setToolType: (e) => {
                const type = e.target.value;
                const tool = this.state.tool;
                this.setState({
                    tool: {
                        ...tool,
                        type: type
                    }
                });
            },
            addTool: () => {
                const tools = [...this.state.tools];
                const tool = this.state.tool;
                tools.push(tool);
                tools.sort(this.toolSortCompare);
                this.setState({
                    tools: tools
                });
                pubsub.publish('tools:updated');
            },
            deleteTool: (index) => {
                const tools = [...this.state.tools];
                tools.splice(index, 1);
                this.setState({
                    tools: [...tools]
                });
                pubsub.publish('tools:updated');
            }
        },
        probe: {
            handleToggleChange: (...keys) => {
                const probe = { ...this.state.probe };
                const functions = { ...probe.functions };

                keys.forEach((key) => {
                    functions[key] = !functions[key];
                });
                this.setState({
                    probe: {
                        ...probe,
                        functions: {
                            ...functions,
                        }
                    }
                });
                pubsub.publish('probe:updated');
            },
            changeRetractionDistance: (e) => {
                const probeSettings = { ...this.state.probeSettings };
                const value = Math.abs(Number(e.target.value).toFixed(3) * 1);

                const { units } = this.state;

                const metricValue = units === 'mm' ? value : Math.abs(convertToMetric(value));
                const imperialValue = units === 'in' ? value : Math.abs(convertToImperial(value));

                this.setState({
                    probeSettings: {
                        ...probeSettings,
                        retractionDistance: {
                            mm: metricValue,
                            in: imperialValue,
                        }
                    }
                });
            },
            changeNormalFeedrate: (e) => {
                const probeSettings = { ...this.state.probeSettings };
                const value = Math.abs(Number(e.target.value).toFixed(3) * 1);
                const { units } = this.state;

                const metricValue = units === 'mm' ? value : Math.abs(convertToMetric(value));
                const imperialValue = units === 'in' ? value : Math.abs(convertToImperial(value));

                this.setState({
                    probeSettings: {
                        ...probeSettings,
                        normalFeedrate: {
                            mm: metricValue,
                            in: imperialValue,
                        }
                    }
                });
            },
            changeFastFeedrate: (e) => {
                const probeSettings = { ...this.state.probeSettings };
                const value = Math.abs(Number(e.target.value).toFixed(3) * 1);
                const { units } = this.state;

                const metricValue = units === 'mm' ? value : Math.abs(convertToMetric(value));
                const imperialValue = units === 'in' ? value : Math.abs(convertToImperial(value));

                this.setState({
                    probeSettings: {
                        ...probeSettings,
                        fastFeedrate: {
                            mm: metricValue,
                            in: imperialValue,
                        }
                    }
                });
            },
            changeXYThickness: (e) => {
                const value = Math.abs(Number(e.target.value));
                const probe = { ...this.state.probe };
                const { units } = this.state;

                const metricValue = units === 'mm' ? value : Math.abs(convertToMetric(value));
                const imperialValue = units === 'in' ? value : Math.abs(convertToImperial(value));

                this.setState({
                    probe: {
                        ...probe,
                        xyThickness: {
                            mm: metricValue,
                            in: imperialValue
                        }
                    }
                });
                pubsub.publish('probe:updated');
            },
            changeZThickness: (e) => {
                const value = Math.abs(Number(e.target.value));
                const probe = { ...this.state.probe };
                const { units } = this.state;

                const metricValue = units === 'mm' ? value : convertToMetric(value);
                const imperialValue = units === 'in' ? value : convertToImperial(value);

                this.setState({
                    probe: {
                        ...probe,
                        zThickness: {
                            mm: metricValue,
                            in: imperialValue
                        }
                    }
                });
                pubsub.publish('probe:updated');
            },
            changePlateWidth: (e) => {
                const value = Math.abs(Number(e.target.value));
                const probe = { ...this.state.probe };

                const { units } = this.state;

                const metricValue = units === 'mm' ? value : convertToMetric(value);
                const imperialValue = units === 'in' ? value : convertToImperial(value);

                this.setState({
                    probe: {
                        ...probe,
                        plateWidth: {
                            mm: metricValue,
                            in: imperialValue
                        }
                    }
                });
            },
            changePlateLength: (e) => {
                const value = Math.abs(Number(e.target.value));
                const probe = { ...this.state.probe };

                const { units } = this.state;

                const metricValue = units === 'mm' ? value : convertToMetric(value);
                const imperialValue = units === 'in' ? value : convertToImperial(value);

                this.setState({
                    probe: {
                        ...probe,
                        plateLength: {
                            mm: metricValue,
                            in: imperialValue
                        }
                    }
                });
            },
            changeConnectivityTest: (value) => {
                const probeSettings = { ...this.state.probeSettings };
                this.setState({
                    probeSettings: {
                        ...probeSettings,
                        connectivityTest: value
                    }
                });
                pubsub.publish('probe:test', value);
            }
        },
        laser: {
            handleOffsetChange: (e, axis) => {
                const { laser } = this.spindleConfig.get('laser');
                const value = Math.abs(Number(e.target.value)) || 0;
                if (axis === 'X') {
                    this.spindleConfig.set('laser.xOffset', value);
                    this.setState({
                        laser: {
                            ...laser,
                            xOffset: value
                        }
                    });
                } else if (axis === 'Y') {
                    this.spindleConfig.set('laser.yOffset', value);
                    this.setState({
                        laser: {
                            ...laser,
                            yOffset: value
                        }
                    });
                }
            },
            setPower: (val, type) => {
                const amount = Math.abs(Number(val));
                const { spindle, laser } = this.state;

                if (!val || !type || amount < 0) {
                    return;
                }

                const newLaserValue = { ...laser, [type]: amount };

                this.setState({ spindle: { ...spindle, laser: newLaserValue } });

                pubsub.publish('laser:updated', newLaserValue);
            },
        },
        spindle: {
            setSpeed: (val, type) => {
                const amount = Math.abs(Number(val));
                const { spindle } = this.state;

                if (!val || !type) {
                    return;
                }

                const newSpindleValue = { ...spindle, [type]: amount };

                this.setState({ spindle: newSpindleValue });

                pubsub.publish('spindle:updated', newSpindleValue);
            }
        },
        visualizer: {
            handleMinimizeRenderToggle: () => {
                const { visualizer } = this.state;
                const { minimizeRenders } = visualizer;
                this.setState({
                    visualizer: {
                        ...visualizer,
                        minimizeRenders: !minimizeRenders
                    }
                });
                pubsub.publish('visualizer:settings');
            },
            handleThemeChange: (theme) => {
                const { visualizer } = this.state;
                this.setState({
                    visualizer: {
                        ...visualizer,
                        theme: theme.value,
                    }
                });
                pubsub.publish('theme:change', theme.value);
            },
            handleCustThemeChange: (theme, part) => {
                const { visualizer } = this.state;
                this.visualizerConfig.set(theme + ' ' + part,
                    this.visualizerConfig.get('temp ' + theme + ' ' + part));
                this.setState({
                    visualizer: {
                        ...visualizer,
                        theme: theme
                    }
                });
                pubsub.publish('theme:change', theme);
            },
            handleChangeComplete: (color, part) => {
                const { visualizer } = this.state;
                this.visualizerConfig.set('temp ' + visualizer.theme + ' ' + part, color.hex);
            },
            handlePartChange: () => {
                pubsub.publish('part:change');
            },
            getDefaultColour: (theme, part) => {
                let defaultColour;
                let themeType = DARK_THEME_VALUES;
                if (theme === CUST_LIGHT_THEME) {
                    themeType = LIGHT_THEME_VALUES;
                }
                switch (part) {
                case 'Background':
                    defaultColour = themeType.backgroundColor;
                    break;
                case 'Grid':
                    defaultColour = themeType.gridColor;
                    break;
                case 'X Axis':
                    defaultColour = themeType.xAxisColor;
                    break;
                case 'Y Axis':
                    defaultColour = themeType.yAxisColor;
                    break;
                case 'Z Axis':
                    defaultColour = themeType.zAxisColor;
                    break;
                case 'Limit':
                    defaultColour = themeType.limitColor;
                    break;
                case 'Cutting Coordinates Lines':
                    defaultColour = themeType.cuttingCoordinateLines;
                    break;
                case 'Jogging Coordinates Lines':
                    defaultColour = themeType.joggingCoordinateLines;
                    break;
                case 'G0':
                    defaultColour = themeType.G0Color;
                    break;
                case 'G1':
                    defaultColour = themeType.G1Color;
                    break;
                case 'G2':
                    defaultColour = themeType.G2Color;
                    break;
                case 'G3':
                    defaultColour = themeType.G3Color;
                    break;
                default:
                    defaultColour = '#000000';
                }
                return defaultColour;
            },
            getCurrentColor: (part, defaultColour) => {
                const { visualizer } = this.state;
                if (visualizer.theme === LIGHT_THEME) {
                    return LIGHT_THEME_VALUES.backgroundColor;
                } else if (visualizer.theme === DARK_THEME) {
                    return DARK_THEME_VALUES.backgroundColor;
                } else {
                    return this.visualizerConfig.get(visualizer.theme + ' ' + part)
                        ? this.visualizerConfig.get(visualizer.theme + ' ' + part)
                        : defaultColour;
                }
            },
            resetCustomThemeColours: (theme) => {
                let themeColours = DARK_THEME_VALUES;
                if (theme === CUST_LIGHT_THEME) {
                    themeColours = LIGHT_THEME_VALUES;
                }
                this.visualizerConfig.set(theme + ' Background', themeColours.backgroundColor);
                this.visualizerConfig.set(theme + ' Grid', themeColours.gridColor);
                this.visualizerConfig.set(theme + ' X Axis', themeColours.xAxisColor);
                this.visualizerConfig.set(theme + ' Y Axis', themeColours.yAxisColor);
                this.visualizerConfig.set(theme + ' Z Axis', themeColours.zAxisColor);
                this.visualizerConfig.set(theme + ' Limit', themeColours.limitColor);
                this.visualizerConfig.set(theme + ' Cutting Coordinate Lines', themeColours.cuttingCoordinateLines);
                this.visualizerConfig.set(theme + ' Jogging Coordinate Lines', themeColours.joggingCoordinateLines);
                this.visualizerConfig.set(theme + ' G0', themeColours.G0Color);
                this.visualizerConfig.set(theme + ' G1', themeColours.G1Color);
                this.visualizerConfig.set(theme + ' G2', themeColours.G2Color);
                this.visualizerConfig.set(theme + ' G3', themeColours.G3Color);

                pubsub.publish('theme:change');
            },
            handleVisEnabledToggle: (liteMode = false) => {
                const { visualizer } = this.state;
                if (liteMode) {
                    const value = visualizer.disabledLite;
                    this.setState({
                        visualizer: {
                            ...visualizer,
                            disabledLite: !value
                        }
                    });
                } else {
                    const value = visualizer.disabled;
                    this.setState({
                        visualizer: {
                            ...visualizer,
                            disabled: !value
                        }
                    });
                }
                pubsub.publish('visualizer:settings');
            },
            handleCutPathToggle: (liteMode = false) => {
                const { visualizer } = this.state;
                const { objects } = visualizer;
                const { cutPath } = objects;
                if (liteMode) {
                    const value = cutPath.visibleLite;
                    this.setState({
                        visualizer: {
                            ...visualizer,
                            objects: {
                                ...objects,
                                cutPath: {
                                    ...cutPath,
                                    visibleLite: !value
                                }
                            }
                        }
                    });
                } else {
                    const value = cutPath.visible;
                    this.setState({
                        visualizer: {
                            ...visualizer,
                            objects: {
                                ...objects,
                                cutPath: {
                                    ...cutPath,
                                    visible: !value
                                }
                            }
                        }
                    });
                }
                pubsub.publish('visualizer:settings');
            },
            handleAnimationToggle: (liteMode = false) => {
                const { visualizer } = this.state;
                const { objects } = visualizer;
                const { cuttingToolAnimation } = objects;
                if (liteMode) {
                    const value = cuttingToolAnimation.visibleLite;
                    this.setState({
                        visualizer: {
                            ...visualizer,
                            objects: {
                                ...objects,
                                cuttingToolAnimation: {
                                    ...cuttingToolAnimation,
                                    visibleLite: !value
                                }
                            }
                        }
                    });
                } else {
                    const value = cuttingToolAnimation.visible;
                    this.setState({
                        visualizer: {
                            ...visualizer,
                            objects: {
                                ...objects,
                                cuttingToolAnimation: {
                                    ...cuttingToolAnimation,
                                    visible: !value
                                }
                            }
                        }
                    });
                }
                pubsub.publish('visualizer:settings');
            },
            handleBitToggle: (liteMode = false) => {
                const { visualizer } = this.state;
                const { objects } = visualizer;
                const { cuttingTool } = objects;
                if (liteMode) {
                    const value = cuttingTool.visibleLite;
                    this.setState({
                        visualizer: {
                            ...visualizer,
                            objects: {
                                ...objects,
                                cuttingTool: {
                                    ...cuttingTool,
                                    visibleLite: !value
                                }
                            }
                        }
                    });
                } else {
                    const value = cuttingTool.visible;
                    this.setState({
                        visualizer: {
                            ...visualizer,
                            objects: {
                                ...objects,
                                cuttingTool: {
                                    ...cuttingTool,
                                    visible: !value
                                }
                            }
                        }
                    });
                }
                pubsub.publish('visualizer:settings');
            }
        },
        terminal: {
            updateCopyLines: (val) => {
                let value = Number(val);

                if (value > TERMINAL_MAX_LINES_TO_COPY) {
                    value = TERMINAL_MAX_LINES_TO_COPY;
                }

                this.setState(prev => ({ terminal: { ...prev.terminal, nLinesToCopy: value } }));
            }
        }
    }

    componentDidMount() {
        controller.command('settings:updated', this.state);

        gamepad.holdListener();
    }

    componentWillUnmount() {
        gamepad.unholdLisetner();
    }

    componentDidUpdate(prevProps, prevState) {
        const { tools, tool, probe, probeSettings, units, reverseWidgets, autoReconnect, visualizer, safeRetractHeight, spindle, terminal } = this.state;

        store.set('workspace.reverseWidgets', reverseWidgets);
        store.set('workspace.safeRetractHeight', safeRetractHeight);
        store.set('widgets.connection.autoReconnect', autoReconnect);
        store.set('widgets.visualizer.theme', visualizer.theme);
        store.set('widgets.visualizer.disabled', visualizer.disabled);
        store.set('widgets.visualizer.disabledLite', visualizer.disabledLite);
        store.set('widgets.visualizer.minimizeRenders', visualizer.minimizeRenders);
        store.set('workspace.units', units);
        store.replace('workspace[tools]', tools);
        store.replace('widgets.visualizer.objects', visualizer.objects);
        store.set('workspace[tool]', tool);
        store.replace('workspace[probeProfile]', probe);
        store.set('widgets.spindle.spindleMax', spindle.spindleMax);
        store.set('widgets.spindle.spindleMin', spindle.spindleMin);
        this.probeConfig.set('retractionDistance', probeSettings.retractionDistance);
        this.probeConfig.set('probeFeedrate', probeSettings.normalFeedrate);
        this.probeConfig.set('probeFastFeedrate', probeSettings.fastFeedrate);
        this.probeConfig.set('connectivityTest', probeSettings.connectivityTest);
        store.replace('workspace.terminal.nLinesToCopy', terminal.nLinesToCopy);

        controller.command('settings:updated', this.state);

        if (prevState.selectedMenu !== this.state.selectedMenu) {
            return;
        }

        this.showToast();
    }

    toolSortCompare(a, b) {
        if (a.metricDiameter < b.metricDiameter) {
            return -1;
        }
        if (a.metricDiameter > b.metricDiameter) {
            return 1;
        }
        return 0;
    }

    convertUnits() {
        let { units, safeRetractHeight } = this.state;
        if (units === METRIC_UNITS) {
            safeRetractHeight = convertToImperial(safeRetractHeight);
        } else {
            safeRetractHeight = convertToMetric(safeRetractHeight);
        }
        this.setState({
            safeRetractHeight: safeRetractHeight
        });
        pubsub.publish('safeHeight:update', safeRetractHeight);
    }

    render() {
        const { modalClose } = this.props;
        const state = { ...this.state };
        const actions = { ...this.actions };
        const { menu, selectedMenu } = state;

        return (
            <Modal onClose={modalClose}>
                <div className={styles.preferencesContainer}>
                    <div className={styles.preferencesContent}>
                        <div className={styles.preferencesMenu}>
                            <h3>Settings</h3>
                            {
                                menu.map((menuItem, index) => (
                                    <button
                                        type="button"
                                        key={`section-${menuItem.label}`}
                                        className={index === selectedMenu ? styles.activeMenu : ''}
                                        onClick={() => actions.setSelectedMenu(index)}
                                    >
                                        { menuItem.label }
                                    </button>
                                ))
                            }
                        </div>
                        <div className={styles.preferencesOptions}>
                            {
                                menu.map((menuItem, index) => (
                                    <div key={menuItem.id}>
                                        <menuItem.component
                                            actions={actions}
                                            state={state}
                                            active={index === selectedMenu}
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default PreferencesPage;
