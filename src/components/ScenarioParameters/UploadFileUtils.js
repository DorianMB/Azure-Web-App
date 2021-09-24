// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import { UPLOAD_FILE_STATUS_KEY } from '@cosmotech/ui';
import { ORGANIZATION_ID, WORKSPACE_ID } from '../../config/AppInstance';
import DatasetService from '../../services/dataset/DatasetService';
import WorkspaceService from '../../services/workspace/WorkspaceService';
import { DatasetsUtils, ScenarioParametersUtils } from '../../utils';

const DATASET_ID_VARTYPE = '%DATASETID%';

// const _uploadFile = async (dataset, datasetFile, setDatasetFile, workspaceId, storageFilePath) => {
//   const previousState = datasetFile.status;
//   try {
//     setDatasetFile({ ...datasetFile, status: UPLOAD_FILE_STATUS_KEY.UPLOADING });
//     const overwrite = true;
//     const { data } = await WorkspaceService.uploadWorkspaceFile(
//       ORGANIZATION_ID, workspaceId, datasetFile.file, overwrite, storageFilePath);
//     // Handle unlikely case where currentDataset is null or undefined
//     // which is most likely to require a manual clean on the backend.
//     if (!dataset) {
//       console.warn('Your previous file was in an inconsistent state. The backend may not be clean.');
//     } else if (Object.keys(dataset).length !== 0) {
//       DatasetsUtils.setFilePathInDataset(dataset, data.fileName);
//     }
//     setDatasetFile({ ...datasetFile, status: UPLOAD_FILE_STATUS_KEY.READY_TO_DOWNLOAD });
//   } catch (e) {
//     console.error(e);
//     setDatasetFile({ ...datasetFile, status: previousState });
//   }
// };

// FIXME: Due to parametersValues inheritance, the workspace file deletion leads to incoherent state when a dataset
// part file is uploaded. For the moment, the workspace file deletion is omitted. This will be fixed in next version
async function _updateFileWithUpload (parameterValueToRender, parameterValue, workspaceId) {
  // // datasetFile, setDatasetFile, dataset, setDataset,
  // // datasetId, parameterId, connectorId, fileName
  //
  // // Register a new dataset with Cosmo API
  // const tags = ['dataset_part'];
  // const { error: creationError, data: createdDataset } = await DatasetService.createDataset(
  //   ORGANIZATION_ID, datasetFile.parameterId, datasetFile.description, { id: connectorId }, tags);
  // if (creationError) {
  //   console.error(creationError);
  //   return null;
  // }
  //
  // // Update created dataset with connector data (including file path in Azure Storage, based on dataset id)
  // const datasetId = createdDataset.id;
  // const datasetTargetPath = DatasetsUtils.buildStorageFilePath(datasetId, fileName);
  // createdDataset.connector = DatasetsUtils.buildAzureStorageConnector(connectorId, datasetTargetPath);
  // const { error: updateError, data: updatedDataset } = await DatasetService.updateDataset(
  //   ORGANIZATION_ID, datasetId, createdDataset);
  // if (updateError) {
  //   console.error(updateError);
  //   return null;
  // }
  // // TODO: add dataset to datasets list in redux
  // console.log(updatedDataset);
  //
  // // Upload file to cloud storage service (e.g. Azure Storage)
  // // TODO: try to remove the 'await' keyword, waiting should be necessary
  // await _uploadFile(dataset, datasetFile, setDatasetFile, workspaceId, datasetTargetPath);
  // return datasetId;
}

// FIXME: Due to parametersValues inheritance, the workspace file deletion leads to incoherent state when a dataset
// part file is uploaded. For the moment, the workspace file deletion is omitted. This will be fixed in next version
async function _updateFileWithDelete () {
  return null;
}

async function _applyDatasetChange (parameterValueToRender, parameterValue, workspaceId) {
  const fileStatus = parameterValueToRender.status;
  // TODO
  if (fileStatus === UPLOAD_FILE_STATUS_KEY.READY_TO_UPLOAD) {
    if (fileStatus === 1) {
      return await _updateFileWithUpload(parameterValueToRender, parameterValue, workspaceId);
      // return await _updateFileWithUpload(datasetFile, setDatasetFile, dataset, setDataset, datasetId,
      //   parameterId, connectorId, workspaceId, datasetFile.name);
    }
    return parameterValue;
  } else if (fileStatus === UPLOAD_FILE_STATUS_KEY.READY_TO_DELETE) {
    return await _updateFileWithDelete();
  } else if (fileStatus === UPLOAD_FILE_STATUS_KEY.READY_TO_DOWNLOAD) {
    return parameterValue;
  }
}

// This function updates the values of parameters with varType %DATASETID% to contain datasets ids, based on the current
// state of the parameter in parametersValuesToRender
async function applyDatasetsChanges (
  solution, parametersMetadata, parametersValuesToRender, parametersValues, workspaceId) {
  for (const parameterId in parametersValuesToRender) {
    const varType = ScenarioParametersUtils.getParameterVarType(solution, parameterId);
    if (varType === DATASET_ID_VARTYPE) {
      const newDatasetId = await _applyDatasetChange(
        parametersValuesToRender[parameterId], parametersValues[parameterId], workspaceId);
      parametersValues[parameterId] = newDatasetId;
    }
  }
}

const prepareToUpload = (event, datasetFile, setDatasetFile) => {
  const file = event.target.files[0];
  if (file === undefined) {
    return;
  }
  setDatasetFile({
    ...datasetFile,
    file: file,
    name: file.name,
    status: UPLOAD_FILE_STATUS_KEY.READY_TO_UPLOAD
  });
};

const prepareToDeleteFile = (setParameterStatusInState) => {
  setParameterStatusInState(UPLOAD_FILE_STATUS_KEY.READY_TO_DELETE);
};

const downloadFile = async (datasetId, setParameterStatusInState) => {
  const { error, data } = await DatasetService.findDatasetById(ORGANIZATION_ID, datasetId);
  if (error) {
    console.error(error);
    throw new Error(`Error finding dataset ${datasetId}`);
  } else {
    const storageFilePath = DatasetsUtils.getStorageFilePathFromDataset(data);
    if (storageFilePath !== undefined) {
      setParameterStatusInState(UPLOAD_FILE_STATUS_KEY.DOWNLOADING);
      await WorkspaceService.downloadWorkspaceFile(ORGANIZATION_ID, WORKSPACE_ID, storageFilePath);
      setParameterStatusInState(UPLOAD_FILE_STATUS_KEY.READY_TO_DOWNLOAD);
    }
  }
};

const _findDatasetInDatasetsList = (datasets, datasetId) => {
  return datasets?.find(dataset => dataset.id === datasetId);
};

function buildDatasetRenderingData (datasets, datasetId) {
  const dataset = _findDatasetInDatasetsList(datasets, datasetId);
  if (dataset === undefined) {
    return {
      id: datasetId,
      name: '',
      fileContent: null,
      status: UPLOAD_FILE_STATUS_KEY.EMPTY
    };
  }
  return {
    id: datasetId,
    name: DatasetsUtils.getFileNameFromDataset(dataset),
    fileContent: null,
    status: UPLOAD_FILE_STATUS_KEY.READY_TO_DOWNLOAD
  };
}

export const UploadFileUtils = {
  downloadFile,
  prepareToDeleteFile,
  prepareToUpload,
  applyDatasetsChanges,
  buildDatasetRenderingData
};
