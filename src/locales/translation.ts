const translation = {
  common: {
    auth: {
      login: {
        cn: '登录',
        en: 'Login'
      },
      logout: {
        cn: '退出',
        en: 'Logout'
      },
      ssoButton: {
        cn: 'SSO 登录',
        en: 'Sign in with SSO'
      },
      errors: {
        failed: {
          cn: '登录失败，请重试',
          en: 'Failed to login. Please try again.'
        }
      }
    },
    menu: {
      home: {
        cn: '首页',
        en: 'Home'
      },
      database: {
        cn: '数据',
        en: 'Data'
      },
      chartAnalysis: {
        cn: '图表分析',
        en: 'Chart Lab'
      },
      user: {
        cn: '用户',
        en: 'User'
      }
    }
  },
  database: {
    generateSQL: {
      button: {
        cn: '生成 SQL',
        en: 'Generate SQL'
      },
      success: {
        cn: 'SQL 生成成功',
        en: 'SQL generated successfully'
      },
      error: {
        cn: 'SQL 生成失败',
        en: 'Failed to generate SQL'
      }
    }
  },
  chart: {
    visualization: {
      title: {
        cn: '图表可视化',
        en: 'Chart Visualization'
      },
      activeUsers: {
        cn: '活跃用户',
        en: 'Active Users'
      },
      count: {
        cn: '数量',
        en: 'Count'
      },
      distribution: {
        cn: '分布',
        en: 'Distribution'
      },
      region: {
        cn: '地区',
        en: 'Region'
      },
      country: {
        cn: '国家',
        en: 'Country'
      }
    },
    controls: {
      selectChartType: {
        cn: '选择图表类型',
        en: 'Select Chart Type'
      },
      adjustConfig: {
        cn: '调整图表配置',
        en: 'Adjust Chart Configuration'
      },
      filterData: {
        cn: '筛选数据',
        en: 'Filter Data'
      },
      exportChart: {
        cn: '导出图表',
        en: 'Export Chart'
      },
      high: {
        cn: '高',
        en: 'High'
      },
      low: {
        cn: '低',
        en: 'Low'
      },
      value: {
        cn: '值',
        en: 'Value'
      }
    },
    types: {
      line: {
        cn: '折线图',
        en: 'Line Chart'
      },
      bar: {
        cn: '柱状图',
        en: 'Bar Chart'
      },
      scatter: {
        cn: '散点图',
        en: 'Scatter Plot'
      },
      pie: {
        cn: '饼图',
        en: 'Pie Chart'
      },
      radar: {
        cn: '雷达图',
        en: 'Radar Chart'
      },
      heatmap: {
        cn: '热力图',
        en: 'Heat Map'
      },
      boxplot: {
        cn: '箱线图',
        en: 'Box Plot'
      },
      candlestick: {
        cn: 'K线图',
        en: 'Candlestick'
      },
      map: {
        cn: '地图',
        en: 'Map'
      },
      tree: {
        cn: '树图',
        en: 'Tree'
      },
      treemap: {
        cn: '矩形树图',
        en: 'Treemap'
      },
      sunburst: {
        cn: '旭日图',
        en: 'Sunburst'
      },
      sankey: {
        cn: '桑基图',
        en: 'Sankey'
      }
    },
    message: {
      steps: {
        analyzingData: {
          cn: '正在分析数据，选择合适的图表类型...',
          en: 'Analyzing data and selecting appropriate chart type...'
        },
        generatingChart: {
          cn: '正在生成图表配置...',
          en: 'Generating chart configuration...'
        },
        finished: {
          cn: '图表生成完成',
          en: 'Chart generation completed'
        }
      },
      errors: {
        missingData: {
          cn: '缺少必要的数据或查询信息',
          en: 'Missing required data or query information'
        },
        generateFailed: {
          cn: '生成图表配置失败，请重试',
          en: 'Failed to generate chart configuration, please try again'
        }
      },
      chartType: {
        selected: {
          cn: '已选择图表类型：',
          en: 'Selected Chart Type: '
        }
      }
    },
    pipeline: {
      errors: {
        missingInputs: {
          cn: '缺少必要的输入：',
          en: 'Missing required inputs: '
        },
        datasetNotFound: {
          cn: '未找到数据集',
          en: 'Dataset not found'
        },
        dataNotFound: {
          cn: '在聊天历史中未找到数据',
          en: 'Data not found in chat history'
        },
        invalidData: {
          cn: '处理后的数据格式无效或为空',
          en: 'Invalid or empty data format after processing'
        },
        csvProcessing: {
          cn: '处理 CSV 数据格式时出错',
          en: 'Error processing CSV data format'
        }
      }
    },
    config: {
      mapRoam: {
        cn: '启用地图缩放和平移',
        en: 'Enable Map Zoom & Pan'
      },
      mapShowLabel: {
        cn: '显示地区标签',
        en: 'Show Region Labels'
      },
      mapShowVisualMap: {
        cn: '显示视觉映射控件',
        en: 'Show Visual Map Control'
      },
      mapVisualMapCalculable: {
        cn: '启用视觉映射范围调节',
        en: 'Enable Visual Map Range Adjustment'
      },
      mapVisualMapMin: {
        cn: '视觉映射最小值',
        en: 'Visual Map Minimum'
      },
      mapVisualMapMax: {
        cn: '视觉映射最大值',
        en: 'Visual Map Maximum'
      }
    }
  }
};

export default translation; 