// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import React from 'react';
import { BasicToggleInput } from '@cosmotech/ui';

const create = (t, parameterData, parametersState, setParametersState, editMode) => {
  const switchFieldProps = {
    disabled: !editMode,
    id: parameterData.id,
    checked: parametersState[parameterData.id] || false
  };

  function setValue (newValue) {
    setParametersState({
      ...parametersState,
      [parameterData.id]: newValue
    });
  }

  return (
    <BasicToggleInput
      key={parameterData.id}
      data-cy={parameterData.dataCy}
      label={ t(`solution.parameters.${parameterData.id}`, parameterData.id) }
      changeSwitchType={setValue}
      switchProps={switchFieldProps}
    />
  );
};

export const BasicToggleInputFactory = {
  create
};
