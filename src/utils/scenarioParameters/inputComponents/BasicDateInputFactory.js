// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import React from 'react';
import { BasicDateInput } from '@cosmotech/ui';

const create = (t, parameterData, parametersState, setParametersState, editMode) => {
  const minDate = parameterData.minValue ? new Date(parameterData.minValue) : undefined;
  const maxDate = parameterData.maxValue ? new Date(parameterData.maxValue) : undefined;
  const dateProps = {
    disabled: !editMode,
    id: parameterData.id,
    value: parametersState[parameterData.id],
    minDate: minDate,
    maxDate: maxDate,
    minDateMessage: t('genericcomponent.dateInput.error.minDateMessage', 'Minimum date is not respected'),
    maxDateMessage: t('genericcomponent.dateInput.error.maxDateMessage', 'Maximum date is not respected'),
    invalidDateMessage: t('genericcomponent.dateInput.error.invalidDateMessage', 'Date is invalid')
  };

  function setValue (newValue) {
    setParametersState({
      ...parametersState,
      [parameterData.id]: newValue
    });
  }

  return (
    <BasicDateInput
      key={parameterData.id}
      data-cy={parameterData.dataCy} // Optional data for cypress
      label={ t(`solution.parameters.${parameterData.id}`, parameterData.id) }
      changeSelectedDate={setValue}
      dateProps={dateProps}
    />
  );
};

export const BasicDateInputFactory = {
  create
};
