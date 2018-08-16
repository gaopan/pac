export default {
  getDashboardSetupData: {
    "caseDistributionTrendBy": [{
      "key": "CASE.startTime",
      "label": "Start Time"
    }, {
      "key": "CASE.endTime",
      "label": "End Time"
    }],
    "valueComparisonBy": [{
      "key": "CASE.invoiceType",
      "label": "Invoice Type"
    }, {
      "key": "CASE.companyCode",
      "label": "Company Code"
    }, {
      "key": "CASE.documentType",
      "label": "Document Type"
    }, {
      "key": "CASE.channel",
      "label": "Channel"
    }, {
      "key": "ACTIVITY.activityName",
      "label": "Activity Name"
    }],
    "valueRankingBy": [{
      "key": "ACTIVITY.caseId",
      "label": "CaseID"
    }, {
      "key": "ACTIVITY.activityName",
      "label": "ActivityName"
    }, {
      "key": "ACTIVITY.activityStart",
      "label": "StartTime"
    }, {
      "key": "ACTIVITY.activityEnd",
      "label": "EndTime"
    }, {
      "key": "ACTIVITY.discrepancy",
      "label": "Discrepancy"
    }, {
      "key": "CASE.invoiceType",
      "label": "InvoiceType"
    }, {
      "key": "CASE.companyCode",
      "label": "CompanyCode"
    }, {
      "key": "CASE.documentType",
      "label": "DocumentType"
    }, {
      "key": "CASE.channel",
      "label": "Channel"
    }, {
      "key": "CASE.vendorName",
      "label": "Vendor"
    }, {
      "key": "CASE.netAmount",
      "label": "NetAmount"
    }, {
      "key": "CASE.grossAmount",
      "label": "GrossAmount"
    }, {
      "key": "CASE.currencyCode",
      "label": "CurrencyCode"
    }, {
      "key": "ACTIVITY.previousActivityEndTime",
      "label": "PreviousActivityEndTime"
    }, {
      "key": "ACTIVITY.previousActivityName",
      "label": "PreviousActivityName"
    }, {
      "key": "ACTIVITY.userName",
      "label": "UserName"
    }, {
      "key": "CASE.invoiceType",
      "label": "Invoice Type"
    }, {
      "key": "CASE.documentType",
      "label": "Document Type"
    }, {
      "key": "CASE.netAmount",
      "label": "Net Amount"
    }, {
      "key": "CASE.grossAmount",
      "label": "Gross Amount"
    }, {
      "key": "CASE.currencyCode",
      "label": "Currency Code"
    }],
    "valueGroupBy": {
      type: ['SUM', 'AVERAGE', 'MAXIMUM', 'MINIMUM'],
      field: [{
        "key": "CASE.netAmount",
        "label": "NetAmount"
      }, {
        "key": "CASE.grossAmount",
        "label": "GrossAmount"
      }],
      groupBy: [{
          "key": "CASE.channel",
          "label": "Channel"
        },
        {
          "key": "CASE.vendorName",
          "label": "Vendor"
        }, {
          "key": "CASE.currencyCode",
          "label": "Currency Code"
        }
      ]
    },
  },
  getLatestDashboardConfig: {
    "processId": "5a4de157c9e77c000608acce",
    "dashboardType": "PROCESS",
    "userId": null,
    "caseDistributionTrendBy": [{
        "key": "CASE.auto_StartTime",
        "label": "StartTime"
      },
      {
        "key": "CASE.auto_EndTime",
        "label": "EndTime"
      }
    ],
    "valueComparisonBy": [{
        "key": "CASE.auto_InvoiceType",
        "label": "InvoiceType"
      },
      {
        "key": "CASE.auto_DocumentType",
        "label": "DocumentType"
      },
      {
        "key": "CASE.auto_Channel",
        "label": "Channel"
      },
      {
        "key": "ACTIVITY.auto_ActivityName",
        "label": "ActivityName"
      }
    ],
    "valueRankingBy": [{
        "key": "CASE.auto_VendorName",
        "label": "VendorName"
      },
      {
        "key": "ACTIVITY.auto_Discrepancy",
        "label": "ActivityName"
      }
    ],
    "aggregations": [{
        "aggregate": "SUM",
        "by": {
          "key": "CASE.auto_NetAmount",
          "label": "NetAmount"
        },
        "groupBy": {
          "key": "CASE.auto_CaseId",
          "label": "CaseId"
        },
        "order": 1
      },
      {
        "aggregate": "AVERAGE",
        "by": {
          "key": "CASE.auto_GrossAmount",
          "label": "GrossAmount"
        },
        "groupBy": {
          "key": "CASE.auto_CaseId",
          "label": "CaseId"
        },
        "order": 2
      }
    ],
    "selected": false
  },
  getSystemLevelConfig: {
    "id": "5a687ba7518991374ca54c75",
    "createdOn": 1516796839043,
    "modifiedOn": 1516796839044,
    "dashboardConfiguration": {
      "processId": "5a4de157c9e77c000608acce",
      "dashboardType": "PROCESS",
      "userId": null,
      "caseDistributionTrendBy": [{
          "key": "CASE.auto_StartTime",
          "label": "StartTime"
        },
        {
          "key": "CASE.auto_EndTime",
          "label": "EndTime"
        }
      ],
      "valueComparisonBy": [{
          "key": "CASE.auto_InvoiceType",
          "label": "InvoiceType"
        },
        {
          "key": "CASE.auto_DocumentType",
          "label": "DocumentType"
        },
        {
          "key": "CASE.auto_Channel",
          "label": "Channel"
        },
        {
          "key": "ACTIVITY.auto_ActivityName",
          "label": "ActivityName"
        }
      ],
      "valueRankingBy": [{
          "key": "CASE.auto_VendorName",
          "label": "VendorName"
        },
        {
          "key": "ACTIVITY.auto_Discrepancy",
          "label": "ActivityName"
        }
      ],
      "aggregations": [{
          "aggregate": "SUM",
          "by": {
            "key": "CASE.auto_NetAmount",
            "label": "NetAmount"
          },
          "groupBy": {
            "key": "CASE.auto_CaseId",
            "label": "CaseId"
          },
          "order": 1
        },
        {
          "aggregate": "AVERAGE",
          "by": {
            "key": "CASE.auto_GrossAmount",
            "label": "GrossAmount"
          },
          "groupBy": {
            "key": "CASE.auto_CaseId",
            "label": "CaseId"
          },
          "order": 2
        }
      ],
      "selected": false
    },
    "deleted": false
}


  ,
  getPersonalLevelConfig:{     
    "id": "5a687d03518991374ca54c76",
    "createdOn": 1516797187697,
    "modifiedOn": 1516798208098,
    "dashboardConfiguration": {
      "processId": "5a4de157c9e77c000608acce",
      "dashboardType": "USER",
      "userId": "59a7b175a49fba02c75971f7",
      "caseDistributionTrendBy": [{
        "key": "CASE.auto_StartTime",
        "label": "StartTime"
      }],
      "valueComparisonBy": [{
          "key": "CASE.auto_InvoiceType",
          "label": "InvoiceType"
        },
        {
          "key": "CASE.auto_Channel",
          "label": "Channel"
        },
        {
          "key": "CASE.auto_ActivityName",
          "label": "ActivityName"
        }
      ],
      "valueRankingBy": [{
          "key": "CASE.auto_VendorName",
          "label": "VendorName"
        },
        {
          "key": "ACTIVITY.auto_Discrepancy",
          "label": "Discrepancy"
        },
        {
          "key": "CASE.auto_ActivityName",
          "label": "ActivityName"
        }
      ],
      "aggregations": [{
        "aggregate": "SUM",
        "by": {
          "key": "CASE.auto_NetAmount",
          "label": "NetAmount"
        },
        "groupBy": {
          "key": "CASE.auto_CaseId",
          "label": "CaseId"
        },
        "order": 1
      }],
      "selected": true
    }
  },
  getAvailableLevelConfig: [
    "PROCESS",
    "USER"
  ]
}
