import psycopg2


# what to change to run locally

localuser = "postgres"      # change to your user
localpassword = "HO8532"    # change to your password





try:

    # connections to databases

    server = psycopg2.connect(host="localhost", database = "Uni-Plan_Test", user = localuser, password = localpassword)

    server_cursor = server.cursor()      # objects for navigating the databases

    




except(Exception, psycopg2.DatabaseError) as error:
    print(error)


# all this does is close connections, nothing to worry about

finally:
    if server is not None:
        server.close()
