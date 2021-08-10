// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import { CircularProgress } from '@material-ui/core';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { AgGridUtils } from '../AgGridUtils';

const PreviewUploadFile = (props) => {
  const { isLoading, file, showPreview, setShowPreview } = props;
  const isCSVFile = file.file?.type === 'text/csv';
  const isJsonFile = file.file?.type === 'application/json';

  const [rawContent, setRawContent] = useState('');
  const [gridData, setGridData] = useState({
    columnDefs: [],
    rowData: []
  });

  const handleContent = useCallback((reader) => {
    if (isCSVFile) {
      reader.onload = function (evt) {
        const fileData = evt.target.result;
        const { header, rowData } = AgGridUtils.constructPreviewData(fileData);
        setGridData({
          columnDefs: header,
          rowData: rowData
        });
        setShowPreview(true);
      };
    } else {
      reader.onload = function (evt) {
        setRawContent(evt.target.result);
      };
    }
    reader.onerror = function (evt) {
      console.error('error reading file');
      setShowPreview(null);
    };
  }, [isCSVFile, setShowPreview]);

  const readFileData = useCallback((file) => {
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file.file, 'UTF-8');
      handleContent(reader);
    }
  }, [handleContent]);

  useEffect(() => {
    if (showPreview) {
      readFileData(file);
    } else {
      setGridData({ columnDefs: [], rowData: [] });
      setRawContent('');
    }
  }, [file, readFileData, showPreview]);

  console.log(gridData);
  return (
    <>
      { isLoading
        ? <CircularProgress />
        : <BlockContent
          gridData={gridData}
          isCSVFile={isCSVFile}
          isJsonFile={isJsonFile}
          rawContent={rawContent}/>
      }
    </>
  );
};

PreviewUploadFile.propTypes = {
  file: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  setFile: PropTypes.func.isRequired,
  showPreview: PropTypes.bool.isRequired,
  setShowPreview: PropTypes.func.isRequired
};

const BlockContent = (props) => {
  const { isCSVFile, isJsonFile, gridData, rawContent } = props;

  const notDisplayableContent = !isCSVFile && !isJsonFile;

  return (
    <>
      { isCSVFile &&
      <AgGridReact
        columnDefs={gridData.columnDefs}
        rowData={gridData.rowData}/>
      }
      { isJsonFile &&
      <div>
        <pre>
           {rawContent}
        </pre>
      </div>
      }
      { notDisplayableContent &&
      <div>
        {'Content not displayable'}
      </div>
      }
    </>
  );
};

BlockContent.propTypes = {
  isCSVFile: PropTypes.bool.isRequired,
  isJsonFile: PropTypes.bool.isRequired,
  gridData: PropTypes.object.isRequired,
  rawContent: PropTypes.string.isRequired
};

export default PreviewUploadFile;