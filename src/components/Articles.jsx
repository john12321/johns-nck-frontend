import React, { Component } from 'react';
import * as api from '../api';
import ArticleCard from './ArticleCard';
import { Button, FormControl, InputLabel, Select, MenuItem, FormGroup } from '@material-ui/core';
import { Link } from '@reach/router';
import throttle from 'lodash.throttle';
import ArticlePost from './ArticlePost';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';


class Articles extends Component {

  state = {
    articles: [],
    isLoading: true,
    page: 1,
    err: false,
    atEnd: false,
    sortBy: 'created_at',
    sortAsc: false,

  }

  componentDidMount() {
    this.fetchArticles();
    window.scrollTo(0, 0)
    window.addEventListener('scroll', this.throttleScroll);
  }

  componentDidUpdate(prevProps, prevState) {
    const { atEnd, sortBy, sortAsc } = this.state;
    const { topic } = this.props;
    if (topic !== prevProps.topic) {
      this.setState(() => ({ page: 1, err: false }));
      this.fetchArticles();
      window.scrollTo(0, 0)
    }
    if (this.state.page !== prevState.page) {
      if (!atEnd) {
        this.fetchArticles();
        window.scrollTo(0, 0)
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.throttleScroll);
    this.setState((state) => ({ page: 1 })
    )
  };


  handleChange = (event) => {
    const { value } = event;
    this.setState({
      sortBy: value
    }, () => this.fetchArticles())
  }

  fetchArticles() {
    const { topic } = this.props;
    const { page, sortBy, sortAsc } = this.state;
    api
      .getArticles(topic, page, sortBy, sortAsc)
      .then(articles => {
        this.setState(prevState => {
          if (page === 1) {
            return { articles, isLoading: false };
          } else {
            return {
              articles: [...prevState.articles, ...articles],
              isLoading: false
            };
          }
        });
        if (articles.length < 10) {
          this.setState({ atEnd: true })
        }
      })
      .catch(() => {
        window.removeEventListener('scroll', this.throttleScroll);
        this.setState({ err: true, articles: [] })
      })
  }

  handleScroll = () => {
    const scrolledHeight = window.scrollY + window.innerHeight;
    const bottom = document.body.scrollHeight - 200;
    if (scrolledHeight >= bottom) {
      this.setState((state) => {
        return { page: state.page + 1 }
      })
    }
  };

  throttleScroll = throttle(this.handleScroll, 1500);


  render() {
    const { articles, atEnd, err, sortBy } = this.state;
    const { topics } = this.props;
    let cardContent = null;

    cardContent = (
      <div className="cardContent">
        {articles.map(article => {
          return (
            <div
              key={article.article_id}
            >
              <ArticleCard article={article} user={this.props.user} fetchArticles={this.fetchArticles} />
            </div>
          )
        })}
      </div>)

    if (atEnd) {
      return (
        <>
          {cardContent}
          <ArticlePost topics={topics} user={this.props.user} topic={this.props.topic} sortBy={sortBy} />
        </>
      )
    }
    else if (err) {
      return (
        <>
          <p>No articles for this topic yet. Be the first!</p>
          <ArticlePost topics={this.props.topics} user={this.props.user} topic={this.props.topic} />
        </>
      )
    }
    else return (
      <>
        <FormGroup style={{ paddingTop: 30 }} row>
          <FormControl>
            <Dropdown
              options={[
                { value: "created_at", label: "Latest" },
                { value: "comment_count", label: "Most discussed" },
                { value: "votes", label: "Most popular" },
              ]}
              onChange={this.handleChange}
            />
          </FormControl>
          <FormControl>
            {/* <Sort /> */}
          </FormControl>
        </FormGroup>
        {cardContent}
      </>
    )
  }
}


export default Articles;