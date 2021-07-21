# iLert Data Source Plugin 

Data Source Plugins for Incidents in iLert

![preview](docs/assets/ilert-plugins.png)

## How to use

1. Install this plugin using the plugin id `ilert-grafana-datasource`
2. Get the API Key from iLert dashboard 'Profile button > Manage API Keys > Add API Key'
3. Put the application Name and check Read permission (Read access is sufficient)
4. Copy the API Key (without 'Bearer')
5. Add iLert datasource in Grafana
6. Put the API Key to the datasource config
7. Save and Test
8. Add the iLert to your panel in Grafana

## Filter

The query can be filtered either based on 'Status' or 'Alert Source'
