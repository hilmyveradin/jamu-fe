import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Axios from 'axios';

import Spinner from '../../components/Spinner/Spinner';
import Card from '../../components/card-plant/card';

import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';

import SnackBar from '../../components/snackbar/SnackBar';
import ErorPage from '../ErrorPage/ErorPage';

import ModalCrude from '../../components/modal-crude/ModalCrude';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import HomeIcon from '@material-ui/icons/Home';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import { emphasize } from '@material-ui/core/styles';

const styles = {
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center'
  },
  input: {
    marginLeft: 8,
    flex: 1
  },
  iconButton: {
    padding: 10
  }
};

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

class Plant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loadData: false,
      inputSearch: '',
      plans: [],
      onSearch: false,
      currentPage: 1,
      snackbar: {
        open: false,
        success: false,
        message: ''
      },
      onSelect: null,
      modal: {
        open: false,
        id: ''
      }
    };
    this.onScroll = this.onScroll.bind(this);
    this.ok = this.ok.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getDataSearch = this.getDataSearch.bind(this);
    this.afterUpdate = this.afterUpdate.bind(this);
    this.closeBtn = this.closeBtn.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.modalCrude = this.modalCrude.bind(this);
  }

  async componentDidMount() {
    window.addEventListener('scroll', this.ok, false);
    window.addEventListener('scroll', this.onScroll, false);

    this.getData();
  }

  topFunction() {
    window.scrollTo(0, 0);
  }

  handleKeyDown(event) {
    if (event.key === 'Enter') {
      this.getDataSearch(event);
    }
  }

  async onScroll() {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      !this.props.isLoading &&
      this.state.onSearch === false
    ) {
      // Do awesome stuff like loading more content!
      await this.setState({
        loadData: true,
        currentPage: this.state.currentPage + 1
      });
      this.getData();
    }
  }

  async ok() {
    if (window.scrollY >= 100) {
      await this.setState({
        top: true
      });
    } else {
      await this.setState({
        top: false
      });
    }
  }

  async modalCrude(id) {
    this.setState({
      modal: {
        open: true,
        id: id
      }
    });
  }

  async getData() {
    try {
      const url = '/jamu/api/plant/pages/' + this.state.currentPage;
      const res = await Axios.get(url);
      const { data } = await res;
      let newData = this.state.plans.concat(data.data);
      this.afterUpdate(data.success, data.message);
      this.setState({
        plans: newData,
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

  async getDataSearch() {
    if (this.state.inputSearch === '') {
      window.location.href = '/plant';
    } else {
      try {
        this.setState({
          loading: true,
          onSearch: true
        });
        const url = '/jamu/api/plant/search';
        let axiosConfig = {
          headers: {
            'Content-Type': 'application/json'
          }
        };
        const res = await Axios.get(
          url,
          {
            params: {
              search: this.state.inputSearch
            }
          },
          axiosConfig
        );
        const { data } = await res;
        let newData = data.data;
        this.afterUpdate(data.success, data.message);
        this.setState({
          plans: newData,
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
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  async afterUpdate(success, message) {
    this.setState({
      snackbar: {
        open: true,
        success: success,
        message: message
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

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '30px'
        }}
      >
        {this.state.top ? (
          <AppBar
            variant="dense"
            style={{
              backgroundColor: '#89b143'
            }}
          >
            <Toolbar>
              <div
                style={{
                  width: '90%',
                  display: 'flex',
                  flexDirection: 'row',
                  margin: 'auto'
                }}
              >
                <div
                  style={{
                    width: '50%',
                    display: 'flex',
                    flexDirection: 'row'
                  }}
                >
                  <Paper className={classes.root} elevation={1}>
                    <InputBase
                      className={classes.input}
                      name="inputSearch"
                      value={this.state.inputSearch}
                      onChange={this.handleInputChange}
                      onKeyDown={this.handleKeyDown}
                      placeholder="Search base on scientific name"
                    />
                    <IconButton
                      className={classes.iconButton}
                      onClick={this.getDataSearch}
                      aria-label="Search"
                    >
                      <SearchIcon />
                    </IconButton>
                  </Paper>
                </div>
                <div
                  style={{
                    width: '50%',
                    display: 'flex',
                    flexDirection: 'row-reverse'
                  }}
                >
                  <Paper
                    className={classes.root}
                    style={{
                      width: '400px'
                    }}
                    elevation={1}
                  >
                    <Breadcrumbs aria-label="breadcrumb">
                      <StyledBreadcrumb
                        component="a"
                        href="#"
                        label="KMS Jamu"
                        avatar={
                          <Avatar className={classes.avatar}>
                            <HomeIcon />
                          </Avatar>
                        }
                      />
                      <StyledBreadcrumb
                        component="a"
                        href="#"
                        label="Explore"
                      />
                      <StyledBreadcrumb
                        label="Plant"
                        deleteIcon={<ExpandMoreIcon />}
                      />
                    </Breadcrumbs>
                  </Paper>
                </div>
              </div>
            </Toolbar>
          </AppBar>
        ) : null}
        <div
          style={{
            width: '90%',
            display: 'flex',
            flexDirection: 'row',
            margin: 'auto'
          }}
        >
          <div
            style={{
              width: '50%',
              display: 'flex',
              flexDirection: 'row'
            }}
          >
            <Paper className={classes.root} elevation={1}>
              <InputBase
                className={classes.input}
                name="inputSearch"
                value={this.state.inputSearch}
                onChange={this.handleInputChange}
                onKeyDown={this.handleKeyDown}
                placeholder="Search all here"
              />
              <IconButton
                className={classes.iconButton}
                onClick={this.getDataSearch}
                aria-label="Search"
              >
                <SearchIcon />
              </IconButton>
            </Paper>
          </div>
          <div
            style={{
              width: '50%',
              display: 'flex',
              flexDirection: 'row-reverse'
            }}
          >
            <Paper
              className={classes.root}
              style={{
                width: 'fit',
                padding: '0px 20px'
              }}
              elevation={1}
            >
              <Breadcrumbs aria-label="breadcrumb">
                <StyledBreadcrumb
                  component="a"
                  href="#"
                  label="Home"
                  avatar={
                    <Avatar className={classes.avatar}>
                      <HomeIcon />
                    </Avatar>
                  }
                />
                {/* <StyledBreadcrumb component="a" href="#" label="Explore" /> */}
                <StyledBreadcrumb
                  label="Plants"
                  deleteIcon={<ExpandMoreIcon />}
                />
              </Breadcrumbs>
            </Paper>
          </div>
        </div>
        {this.state.onEror ? (
          <ErorPage />
        ) : this.state.loading ? (
          <Spinner />
        ) : (
          <div className="for-card">
            {this.state.plans.map(item => (
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

export default withStyles(styles)(Plant);
