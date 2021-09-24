// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import React from 'react';
import { UploadFile } from '@cosmotech/ui';
// TODO: move file ?
import { UploadFileUtils } from '../../../components/ScenarioParameters/UploadFileUtils';

const create = (t, datasets, parameterData, parametersState, setParametersState, editMode) => {
  const parameterId = parameterData.id;
  const parameter = parametersState[parameterId] || {};
  const datasetId = parameter.id;

  function setParameterInState (newValue) {
    setParametersState({
      ...parametersState,
      [parameterId]: newValue
    });
  }

  function setParameterStatusInState (newStatus) {
    setParameterInState({
      ...parameter,
      status: newStatus
    });
  }

  return (
    <UploadFile
      key={parameterId}
      data-cy={parameterData.dataCy}
      label={ t(`solution.parameters.${parameterId}`, parameterId) }
      acceptedFileTypes={parameterData.defaultFileTypeFilter}
      handleUploadFile={(event) => UploadFileUtils.prepareToUpload(event, parameter, setParameterInState)}
      handleDeleteFile={() => UploadFileUtils.prepareToDeleteFile(setParameterStatusInState)}
      handleDownloadFile={(event) => {
        event.preventDefault();
        UploadFileUtils.downloadFile(datasetId, setParameterStatusInState);
      }}
      file={parameter}
      editMode={editMode}
    />
  );
};

export const UploadFileFactory = {
  create
};
