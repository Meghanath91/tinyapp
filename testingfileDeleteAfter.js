<% if (username) {%>
  <form action="/logout" method="POST">
    <button type="submit" class="btn btn-primary">LOGOUT</button>
  </form>
  <% }else {%>
  <form action="/login" method="POST">
    <input type="text" name="username" placeholder="Enter User Name">
    <button type="submit" class="btn btn-primary">LOGIN</button>
  </form>
  <% }%>