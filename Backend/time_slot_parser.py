import psycopg2


# connects both servers on localhost, 
# reads from the raw database made by Nahyun,
# writes to prototype database

#current build works



# what to change to run locally

localuser = "kimnahyun"      # change to your user
localpassword = "5178"    # change to your password





try:

    raw_database = psycopg2.connect(host="localhost", database = "test_api", user = localuser, password = localpassword)

    proto_build = psycopg2.connect(host="localhost", database = "UniPlan-test", user = localuser, password = localpassword)


    raw_cursor = raw_database.cursor()

    proto_cursor = proto_build.cursor()


    raw_cursor.execute("select raw from wsu_sections;")

        
    for (data,) in raw_cursor:
        print(type(data))  # <class 'dict'>  this line also helpful for seeing how deep into database before error

        meetingsFaculty_list = data.get("meetingsFaculty", [])
        if meetingsFaculty_list:
            meeting_time = meetingsFaculty_list[0].get("meetingTime", {})   
            meeting_start = meeting_time.get("beginTime")   
            meeting_end = meeting_time.get("endTime")
            monday = meeting_time.get("monday")
            tuesday = meeting_time.get("tuesday")
            wednesday = meeting_time.get("wednesday")
            thursday = meeting_time.get("thursday")
            friday = meeting_time.get("friday")
            saturday = meeting_time.get("saturday")
            sunday = meeting_time.get("sunday")
        else:
            building = None
            room_number = None


        # so what is happening below is: 
        # Statements are defined, 
        # values are defined as strings,
        # values are pulled from json, 
        # queries are run


        time_slot_sql = """
        INSERT INTO time_slot
        (id, start_min, end_min, monday, tuesday, wednesday, thursday, friday, saturday, sunday)        
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """

        section_sql = """
        INSERT INTO section
        ("CRN", course_id, term_id, max_reg)
        VALUES (%s, %s, %s, %s);
        """

        time_slot_vals = (
            data.get("id"),
            meeting_start,
            meeting_end,
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday,
            sunday
        )

        # execute command for each iteration, DOES NOT SAVE CHANGES

        proto_cursor.execute(time_slot_sql, time_slot_vals)

        
        


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



