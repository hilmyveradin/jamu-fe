import React, { Component } from 'react';
import Axios from 'axios';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Card from '../../components/card-plant/card';
import Spinner from '../../components/Spinner/Spinner';

import SnackBar from '../../components/snackbar/SnackBar';
import ErorPage from '../ErrorPage/ErorPage';

import ModalCrude from '../../components/modal-crude/ModalCrude';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Chip from '@material-ui/core/Chip';
import { withStyles } from '@material-ui/core/styles';
import { emphasize } from '@material-ui/core/styles/colorManipulator';

import homeLogo from '../PlantDetail/home-icon.png';
import plantLogo from '../PlantDetail/plant-icon.png';

const StyledBreadcrumb = withStyles(theme => ({
  root: {
    backgroundColor: theme.palette.grey[100],
    height: 24,
    color: theme.palette.grey[800],
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.grey[300]
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(theme.palette.grey[300], 0.12)
    }
  }
}))(Chip);

const styles = theme => ({
  avatar: {
    background: 'none',
    marginRight: -theme.spacing(1.5)
  },
  tabs: {
    color: '#5FAD56',
    backgroundColor: 'white'
  },
  indicator: {
    backgroundColor: '#5FAD56',
    color: '#5FAD56'
  }
});
function TabContainer(props) {
  return (
    <Typography
      component="div"
      style={{
        width: '91%',
        margin: 'auto',
        padding: '15px',
        marginBottom: '30px'
      }}
    >
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
};

class DetailHerbMed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      detailHerbMed: [],
      loading: false,
      snackbar: {
        open: false,
        success: false,
        message: ''
      },
      modal: {
        open: false,
        id: ''
      }
    };
    this.handleChange = this.handleChange.bind(this);
    this.afterUpdate = this.afterUpdate.bind(this);
    this.closeBtn = this.closeBtn.bind(this);

    this.modalCrude = this.modalCrude.bind(this);
  }

  async componentDidMount() {
    this.setState({
      loading: true
    });
    await this.getData();
  }

  async getData() {
    try {
      const { id } = this.props.match.params;
      const url = '/jamu/api/herbsmed/get/' + id;
      const res = await Axios.get(url);
      const { data } = await res;
      let RefCrude = await Promise.all(
        data.data.refCrude.map(async dt => {
          let urlCrude = '/jamu/api/crudedrug/get/' + dt.idcrude;
          let resCrude = await Axios.get(urlCrude);
          let { data } = await resCrude;
          return data.data;
        })
      );

      let Plant = RefCrude.map(dt => dt.refPlant[0]);
      Plant = await Promise.all(
        Array.from(
          new Set(
            Plant.filter(dt => {
              if (dt !== null || dt !== undefined) {
                return dt;
              }
              return 0;
            }).map(dt => {
              return dt.idplant;
            })
          )
        ).map(async id => {
          let urlPlant = '/jamu/api/plant/get/' + id;
          let resPlant = await Axios.get(urlPlant);
          let { data } = await resPlant;
          return data.data;
        })
      );
      let detailHerbMed = data.data;
      detailHerbMed.refCrude = RefCrude;
      detailHerbMed.refPlant = Plant;
      this.afterUpdate(data.success, data.message);
      this.setState({
        detailHerbMed: detailHerbMed,
        loading: false
      });
    } catch (err) {
      this.afterUpdate(false, err.message);
      this.setState({
        onEror: true,
        loading: false
      });
    }
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  async afterUpdate(success, message) {
    this.setState({
      snackbar: {
        open: true,
        success: success,
        message: message
      }
    });
  }

  async modalCrude(id) {
    this.setState({
      modal: {
        open: true,
        id: id
      }
    });
  }

  closeBtn() {
    this.setState({
      snackbar: {
        open: false,
        success: false,
        message: ''
      },
      modal: {
        open: false
      }
    });
  }

  render() {
    const { classes } = this.props;
    let { refCompany } = this.state.detailHerbMed;
    let { refDclass } = this.state.detailHerbMed;
    return (
      <div>
        {this.state.onEror ? (
          <ErorPage />
        ) : this.state.loading ? (
          <Spinner />
        ) : (
          <div>
            <Paper
              style={{
                width: '90%',
                margin: 'auto',
                marginTop: '30px',
                marginBottom: '30px',
                padding: '15px',
                display: 'flex'
              }}
              elevation={1}
            >
              <div
                style={{
                  width: '50%'
                }}
              >
                <Typography>Detail {this.state.detailHerbMed.name}</Typography>
              </div>
              <div
                style={{
                  width: '50%',
                  display: 'flex',
                  flexDirection: 'row-reverse'
                }}
              >
                <Breadcrumbs aria-label="breadcrumb">
                  <StyledBreadcrumb
                    component="a"
                    href="/"
                    label={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img
                          src={homeLogo}
                          alt="Logo"
                          style={{ marginRight: '4px' }}
                        />
                        Home
                      </div>
                    }
                  />
                  <StyledBreadcrumb
                    component="a"
                    href="/herbmeds"
                    label={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img
                          src={plantLogo}
                          alt="Logo"
                          style={{ marginRight: '4px' }}
                        />
                        Herbal Medicine
                      </div>
                    }
                  />
                  <StyledBreadcrumb
                    label={this.state.detailHerbMed.name}
                    deleteIcon={<ExpandMoreIcon />}
                  />
                </Breadcrumbs>
              </div>
            </Paper>
            {/* <Paper
              style={{
                width: '85%',
                margin: 'auto',
                marginTop: '30px',
                marginBottom: '10px',
                padding: '30px',
                backgroundColor: 'rgba(0, 0, 0, 0.05)'
              }}
            > */}
            <Paper
              style={{
                width: '90%',
                margin: 'auto',
                marginTop: '20px',
                marginBottom: '10px',
                padding: '15px'
              }}
            >
              {/* <Typography variant="h6" gutterBottom>
                  {this.state.detailHerbMed.name}
                </Typography> */}
              <h5
                style={{
                  margin: '0',
                  color: 'black',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                Company
              </h5>
              <Typography
                style={{ marginTop: '10px', fontSize: '15px' }}
                variant="caption"
                display="block"
                gutterBottom
              >
                {refCompany ? refCompany.cname : null}
              </Typography>
              <h5
                style={{
                  margin: '0',
                  color: 'black',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                Address company
              </h5>
              <Typography
                style={{ marginTop: '10px', fontSize: '15px' }}
                variant="caption"
                display="block"
                gutterBottom
              >
                {refCompany ? refCompany.address : null}
              </Typography>
              <h5
                style={{
                  margin: '0',
                  color: 'black',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                Efficacy
              </h5>
              <Typography
                style={{ marginTop: '10px', fontSize: '15px' }}
                variant="caption"
                display="block"
                gutterBottom
              >
                {this.state.detailHerbMed.efficacy}
              </Typography>
              <h5
                style={{
                  margin: '0',
                  color: 'black',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                Disease class description
              </h5>
              <Typography
                style={{ marginTop: '10px', fontSize: '15px' }}
                variant="caption"
                display="block"
                align="justify"
                gutterBottom
              >
                {refDclass ? refDclass.description : null}
              </Typography>
              <h5
                style={{
                  margin: '0',
                  color: 'black',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                Reference
              </h5>
              <Typography
                style={{ marginTop: '10px', fontSize: '15px' }}
                variant="caption"
                display="block"
                align="justify"
                gutterBottom
              >
                {this.state.detailHerbMed.ref
                  ? this.state.detailHerbMed.ref
                  : null}
              </Typography>
            </Paper>
            <Tabs
              value={this.state.value}
              onChange={this.handleChange}
              centered
              classes={{ root: classes.tabs, indicator: classes.indicator }}
            >
              <Tab label="Crude in this formula" />
              <Tab label="Plant" />

              {/* <Tab label="Compound" /> */}
            </Tabs>
            {/* <Paper
                style={{
                  width: '90%',
                  margin: 'auto',
                  marginTop: '20px',
                  marginBottom: '10px',
                  padding: '30px'
                }}
              > */}
            {this.state.value === 1 && (
              <TabContainer>
                {this.state.detailHerbMed.refPlant !== undefined && (
                  <div className="for-card">
                    {this.state.detailHerbMed.refPlant.map(item => (
                      <Card
                        key={item.id}
                        id={item.idplant}
                        name={item.sname}
                        image={item.refimg}
                        reff={item.refCrude}
                        modalCrude={this.modalCrude}
                      />
                    ))}
                  </div>
                )}
              </TabContainer>
            )}
            {this.state.value === 0 && (
              <TabContainer>
                {this.state.detailHerbMed.refCrude !== undefined &&
                  this.state.detailHerbMed.refCrude.map(itm => {
                    return (
                      <ExpansionPanel>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography style={{ fontSize: '16px' }}>
                            {' '}
                            <i>{itm.sname}</i>
                          </Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails
                          style={{
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <Typography
                            style={{ fontSize: '14px' }}
                            variant="caption"
                            display="block"
                            gutterBottom
                          >
                            <b>Scientific Name:</b> <i>{itm.sname}</i>
                          </Typography>
                          <Typography
                            style={{ fontSize: '14px' }}
                            variant="caption"
                            display="block"
                            gutterBottom
                          >
                            <b>Name (in English):</b> {itm.name_en}
                          </Typography>
                          <Typography
                            style={{ fontSize: '14px' }}
                            variant="caption"
                            display="block"
                            gutterBottom
                          >
                            <b>Local Name I:</b> {itm.name_loc1}
                          </Typography>
                          <Typography
                            style={{ fontSize: '14px' }}
                            variant="caption"
                            display="block"
                            gutterBottom
                          >
                            <b>Local Name II:</b> <i>{itm.name_loc2}</i>
                          </Typography>
                          <Typography
                            style={{ fontSize: '14px' }}
                            variant="caption"
                            display="block"
                            gutterBottom
                          >
                            <b>Global Name:</b> <i>{itm.gname}</i>
                          </Typography>
                          <Typography
                            style={{ fontSize: '14px' }}
                            variant="caption"
                            display="block"
                            gutterBottom
                          >
                            <b>Effect:</b> {itm.effect}
                          </Typography>
                          <Typography
                            style={{ fontSize: '14px' }}
                            variant="caption"
                            display="block"
                            gutterBottom
                          >
                            <b>Location Effect:</b> {itm.effect_loc}
                          </Typography>
                          <Typography
                            style={{ fontSize: '14px' }}
                            variant="caption"
                            display="block"
                            gutterBottom
                          >
                            <b>Reference:</b> {itm.ref}
                          </Typography>
                        </ExpansionPanelDetails>
                      </ExpansionPanel>
                    );
                  })}
              </TabContainer>
            )}
            {/* {this.state.value === 2 && (
                  <TabContainer>
                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Name</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <Typography>item</Typography>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Name</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <Typography>item</Typography>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Name</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <Typography>item</Typography>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </TabContainer>
                )} */}
            {/* </Paper> */}
            {/* </Paper> */}
          </div>
        )}
        {this.state.modal.open === true ? (
          <ModalCrude modal={this.state.modal} close={this.closeBtn} />
        ) : null}
        {this.state.snackbar.open === true ? (
          <SnackBar data={this.state.snackbar} close={this.closeBtn} />
        ) : null}
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(DetailHerbMed);
