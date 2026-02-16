import psycopg2


# connects both servers on localhost, 
# reads from the raw database made by Nahyun,
# writes to prototype database

#current build works



# what to change to run locally

localuser = "postgres"      # change to your user
localpassword = "HO8532"    # change to your password





try:

    raw_database = psycopg2.connect(host="localhost", database = "test_api", user = localuser, password = localpassword)

    proto_build = psycopg2.connect(host="localhost", database = "Uni-Plan_Test", user = localuser, password = localpassword)


    raw_cursor = raw_database.cursor()

    proto_cursor = proto_build.cursor()


    raw_cursor.execute("select raw from wsu_sections;")

        
    for (data,) in raw_cursor:
        print(type(data))  # <class 'dict'>  this line also helpful for seeing how deep into database before error

        faculty_list = data.get("faculty", [])
        if faculty_list:
            instructor = faculty_list[0].get("displayName")             # instructor name is stored in a list of dicts, this if else just finds it
        else:
            instructor = None
            
        meetingsFaculty_list = data.get("meetingsFaculty", [])
        if meetingsFaculty_list:
            meeting_time = meetingsFaculty_list[0].get("meetingTime", {})       # same concept as above
            building = meeting_time.get("building")
            room_number = meeting_time.get("room")
        else:
            building = None
            room_number = None
        


        # so what is happening below is: 
        # Statements are defined, 
        # values are defined as strings,
        # values are pulled from json, 
        # queries are run


        course_sql = """
        INSERT INTO course
        (id, subject, course_number, title, credit_hours, sec_id, instructor, building, room_number)        
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
        """

        section_sql = """
        INSERT INTO section
        ("CRN", course_id, term_id, max_reg)
        VALUES (%s, %s, %s, %s);
        """

        course_vals = (
            data.get("id"),
            data.get("subject"),
            data.get("courseNumber"),
            data.get("courseTitle"),
            data.get("creditHours"),
            data.get("sequenceNumber"),
            instructor,
            building,
            room_number,
        )

        section_vals = (
            data.get("courseReferenceNumber"),
            data.get("id"),
            data.get("term"),
            data.get("maximumEnrollment"),
        )

        # execute command for each iteration, DOES NOT SAVE CHANGES

        proto_cursor.execute(course_sql, course_vals)
        proto_cursor.execute(section_sql, section_vals)

        
        


        # this command commits to database (duh)

    proto_build.commit()




# what this does is send the query error in the python terminal,
# useful for debugging

except(Exception, psycopg2.DatabaseError) as error:
    print(error)


# all this does is close connections, nothing to worry about

finally:
    if raw_database is not None:
        raw_database.close()
    if proto_build is not None:
        proto_build.close()



