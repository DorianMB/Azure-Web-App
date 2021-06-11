// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Typography,
  makeStyles
} from '@material-ui/core';
import { SCENARIO_RUN_STATE } from '../../utils/ApiUtils';
import { SCENARIO_PARAMETERS_TABS_CONFIG } from '../../configs/ScenarioParametersTabs.config';
import { EditModeButton, NormalModeButton, ScenarioParametersTabs } from './components';
import { useTranslation } from 'react-i18next';
import { SimpleTwoActionsDialog } from '@cosmotech/ui';
import { BasicTypes, BarParameters } from './components/tabs';

const useStyles = makeStyles(theme => ({
  header: {
    display: 'flex',
    background: theme.palette.background.secondary,
    color: '#FFFFFF',
    marginLeft: '30px',
    height: '50px',
    paddingTop: '10px'
  },
  rightBar: {
    textAlign: 'right',
    display: 'flex',
    alignItems: 'center',
    margin: `0 ${theme.spacing(3)}px`
  }
}));

const PARAMETERS_DEFAULT_VALUES = {
  stock: 100,
  restock_qty: 25,
  nb_waiters: 5,
  currency: 'USD',
  currency_name: 'EUR',
  currency_value: 1000,
  currency_used: false,
  start_date: new Date('2014-08-18T21:11:54')
};

const getDefaultParameterValue = (parameterId) => {
  return PARAMETERS_DEFAULT_VALUES[parameterId];
};

const ScenarioParameters = ({
  editMode,
  changeEditMode,
  updateAndLaunchScenario,
  launchScenario,
  workspaceId,
  scenarioList,
  currentScenario,
  scenarioId
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  // General states
  const [displayPopup, setDisplayPopup] = useState(false);

  // Current scenario parameters
  const parameters = currentScenario.data.parametersValues;

  const getValueFromParameters = (parameterId) => {
    if (parameters === null || parameters === undefined) {
      return getDefaultParameterValue(parameterId);
    }
    const param = parameters.find(element => element.parameterId === parameterId);
    if (param !== undefined) {
      return param.value;
    }
    return getDefaultParameterValue(parameterId);
  };

  const getParentParameters = () => {
    const parentScenario = scenarioList.data.find(
      scenario => scenario.id === currentScenario.data.parentId);
    return parentScenario?.parametersValues;
  };

  const isInherited = (parentParameters, parameterId, newValue) => {
    // Handle root scenario case
    if (currentScenario.data.parentId === null) {
      return false;
    }
    // Handle undefined parameters for parent scenario (parent scenario has been
    // created and parameters have never been updated)
    if (parentParameters === null || parentParameters === undefined) {
      return newValue === getDefaultParameterValue(parameterId);
    }
    // For the remaining cases, compare with the value of the parameter in the
    // parent scenario
    const parentParamenter = parentParameters.find(
      element => element.parameterId === parameterId);
    if (parentParamenter !== undefined) {
      return parentParamenter.value === newValue;
    }
    // Parameter has not been found (should not happen)
    return false;
  };

  // State for bar parameters
  const [stock, setStock] = useState(getValueFromParameters('stock'));
  const [restockQuantity, setRestockQuantity] = useState(getValueFromParameters('restock_qty'));
  const [waitersNumber, setWaitersNumber] = useState(getValueFromParameters('nb_waiters'));
  // State for basic input types examples parameters
  const [currency, setCurrency] = useState(getValueFromParameters('currency'));
  const [currencyName, setCurrencyName] = useState(getValueFromParameters('currency_name'));
  const [currencyValue, setCurrencyValue] = useState(getValueFromParameters('currency_value'));
  const [currencyUsed, setCurrencyUsed] = useState(getValueFromParameters('currency_used'));
  const [startDate, setStartDate] = useState(getValueFromParameters('start_date'));

  const resetParameters = () => {
    setStock(getValueFromParameters('stock'));
    setRestockQuantity(getValueFromParameters('restock_qty'));
    setWaitersNumber(getValueFromParameters('nb_waiters'));
    setCurrency(getValueFromParameters('currency'));
    setCurrencyName(getValueFromParameters('currency_name'));
    setCurrencyValue(getValueFromParameters('currency_value'));
    setCurrencyUsed(getValueFromParameters('currency_used'));
    setStartDate(getValueFromParameters('start_date'));
  };

  const getParametersDataForApi = (runTemplateId) => {
    const parentParameters = getParentParameters();
    let parametersData = [];
    // Add bar parameters if necessary (run templates '1' and '2')
    if (['1', '2'].indexOf(runTemplateId) !== -1) {
      parametersData = parametersData.concat([
        {
          parameterId: 'stock',
          varType: 'int',
          value: stock,
          isInherited: isInherited(parentParameters, 'stock', stock)
        },
        {
          parameterId: 'restock_qty',
          varType: 'int',
          value: restockQuantity,
          isInherited: isInherited(parentParameters, 'restock_qty', restockQuantity)
        },
        {
          parameterId: 'nb_waiters',
          varType: 'int',
          value: waitersNumber,
          isInherited: isInherited(parentParameters, 'nb_waiters', waitersNumber)
        }
      ]);
    }

    // Add basic inputs examples parameters if necessary (run template '4')
    if (['3'].indexOf(runTemplateId) !== -1) {
      parametersData = parametersData.concat([
        {
          parameterId: 'currency',
          varType: 'enum',
          value: currency,
          isInherited: isInherited(parentParameters, 'currency', currency)
        },
        {
          parameterId: 'currency_name',
          varType: 'string',
          value: currencyName,
          isInherited: isInherited(parentParameters, 'currency_name', currencyName)
        },
        {
          parameterId: 'currency_value',
          varType: 'number',
          value: currencyValue,
          isInherited: isInherited(parentParameters, 'currency_value', currencyValue)
        },
        {
          parameterId: 'currency_used',
          varType: 'bool',
          value: currencyUsed,
          isInherited: isInherited(parentParameters, 'currency_used', currencyUsed)
        },
        {
          parameterId: 'start_date',
          varType: 'date',
          value: startDate,
          isInherited: isInherited(parentParameters, 'start_date', startDate)
        }
      ]);
    }

    // TODO Add file upload parameters if necessary
    // TODO Add array template parameters if necessary
    return parametersData;
  };

  // Update the parameters form when scenario parameters change
  useEffect(() => {
    resetParameters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameters]);

  // Popup part
  const handleClickOnDiscardChangeButton = () => setDisplayPopup(true);
  const handleClickOnPopupCancelButton = () => setDisplayPopup(false);
  const handleClickOnPopupDiscardChangeButton = () => {
    setDisplayPopup(false);
    changeEditMode(false);
    // Reset form values
    resetParameters();
  };

  // Normal Mode Screen
  const handleClickOnEditButton = () => changeEditMode(true);
  const isCurrentScenarioRunning = () => (
    currentScenario.data.state === SCENARIO_RUN_STATE.RUNNING);

  const handleClickOnLaunchScenarioButton = () => {
    // If scenario parameters have never been updated, do it now
    if (!currentScenario.data.parametersValues) {
      handleClickOnUpdateAndLaunchScenarioButton();
    } else {
      launchScenario(workspaceId, scenarioId);
      changeEditMode(false);
    }
  };

  // Edit Mode Screen
  const handleClickOnUpdateAndLaunchScenarioButton = () => {
    const parametersData = getParametersDataForApi(
      currentScenario.data.runTemplateId);
    updateAndLaunchScenario(workspaceId, scenarioId, parametersData);
    changeEditMode(false);
  };

  // Indices in this array must match indices in the tabs configuration file
  // configs/ScenarioParametersTabs.config.js
  const scenarioParametersTabs = [
    <BarParameters key="0"
      stock={stock}
      changeStock={setStock}
      restockQuantity={restockQuantity}
      changeRestockQuantity={setRestockQuantity}
      waitersNumber={waitersNumber}
      changeWaitersNumber={setWaitersNumber}
      editMode={editMode}
    />,
    <BasicTypes key="1"
      textFieldValue={currencyName}
      changeTextField={setCurrencyName}
      numberFieldValue={currencyValue}
      changeNumberField={setCurrencyValue}
      enumFieldValue={currency}
      changeEnumField={setCurrency}
      switchFieldValue={currencyUsed}
      changeSwitchType={setCurrencyUsed}
      selectedDate={startDate}
      changeSelectedDate={setStartDate}
      editMode={editMode}
    />,
    <Typography key="2">Empty</Typography>, // Upload file
    <Typography key="3">Empty</Typography> // Array template
  ];

  // Disable edit button if no tabs are shown
  let tabsShown = false;
  for (const tab of SCENARIO_PARAMETERS_TABS_CONFIG) {
    if (tab.runTemplateIds.indexOf(currentScenario.data.runTemplateId) !== -1) {
      tabsShown = true;
      break;
    }
  }

  return (
      <div>
        <Grid container direction="column" justify="center" alignContent="flex-start" >
          <Grid container className={classes.root} direction="row" justify="space-between" alignContent="flex-start" spacing={5}>
            <Grid item >
              <Typography variant='subtitle1'>
                { t('genericcomponent.text.scenario.parameters.title', 'Scenario parameters') }

              </Typography>
            </Grid>
            <Grid item >
              { editMode
                ? (<EditModeButton classes={classes}
                  handleClickOnDiscardChange={handleClickOnDiscardChangeButton}
                  handleClickOnUpdateAndLaunchScenario={handleClickOnUpdateAndLaunchScenarioButton}/>)
                : (<NormalModeButton classes={classes}
                  handleClickOnEdit={handleClickOnEditButton}
                  handleClickOnLaunchScenario={handleClickOnLaunchScenarioButton}
                  editDisabled={!tabsShown || isCurrentScenarioRunning()}
                  runDisabled={isCurrentScenarioRunning()}/>)
              }
            </Grid>
          </Grid>
        </Grid>
        <Grid item className={classes.tabs}>
          {
            <form>
              <ScenarioParametersTabs
                tabs={scenarioParametersTabs}
                currentScenario={currentScenario}
              />
            </form>
          }
        </Grid>
        <SimpleTwoActionsDialog
            open={displayPopup}
            dialogTitleKey='genericcomponent.dialog.scenario.parameters.title'
            dialogBodyKey='genericcomponent.dialog.scenario.parameters.body'
            cancelLabelKey='genericcomponent.dialog.scenario.parameters.button.cancel'
            validateLabelKey='genericcomponent.dialog.scenario.parameters.button.validate'
            handleClickOnCancel={handleClickOnPopupCancelButton}
            handleClickOnValidate={handleClickOnPopupDiscardChangeButton}/>
      </div>
  );
};

ScenarioParameters.propTypes = {
  editMode: PropTypes.bool.isRequired,
  changeEditMode: PropTypes.func.isRequired,
  updateAndLaunchScenario: PropTypes.func.isRequired,
  launchScenario: PropTypes.func.isRequired,
  workspaceId: PropTypes.string.isRequired,
  scenarioList: PropTypes.object.isRequired,
  scenarioId: PropTypes.string.isRequired,
  currentScenario: PropTypes.object.isRequired
};

export default ScenarioParameters;
