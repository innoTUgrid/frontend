Highcharts.customTheme = {
 
    colors: ['#1BA6A6', '#12734F', '#F2E85C', '#F27329', '#D95D30', '#2C3949', '#3E7C9B', '#9578BE'],
  
    chart: {
        backgroundColor: {
            radialGradient: {cx: 0, cy: 1, r: 1},
            stops: [
                [0, '#ffffff'],
                [1, '#f2f2ff']
            ]
        },
        style: {
            fontFamily: 'arial, sans-serif',
            color: '#333'
        }
    },
    title: {
        style: {
            color: '#222',
            fontSize: '21px',
            fontWeight: 'bold'
        }
    },
    subtitle: {
        style: {
            fontSize: '16px',
            fontWeight: 'bold'
        }
    },
    xAxis: {
        lineWidth: 1,
        lineColor: '#cccccc',
        tickWidth: 1,
        tickColor: '#cccccc',
        labels: {
            style: {
                fontSize: '12px'
            }
        }
    },
    yAxis: {
        gridLineWidth: 1,
        gridLineColor: '#d9d9d9',
        labels: {
           style: {
                fontSize: '12px'
            }
        }
    },
    legend: {
        itemStyle: {
            color: '#666',
            fontSize: '9px'
        },
        itemHoverStyle:{
            color: '#222'
        }  
    }
 };
 Highcharts.setOptions( Highcharts.customTheme );