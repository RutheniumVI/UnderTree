package com.capstoners.Undertree.github;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
class GitCredential {

  private @Id @GeneratedValue Long id;
  private String username;
  private String password;

  GitCredential() {}

  GitCredential(String username, String password) {
    this.username = username;
    this.password = password;
  }

  public Long getId() {
    return this.id;
  }

  public String getUsername() {
    return this.username;
  }

  public String getPassword() {
    return this.password;
  }

  public void setId(Long id) {
    this.id = id;
  }
}